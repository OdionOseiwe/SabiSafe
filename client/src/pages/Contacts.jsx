import { useCallback, useEffect, useState } from "react";
import {
  Link2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageLoader,
  Select,
} from "../components/ui";
import { useConfig } from "../context/ConfigContext";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import { endpoints, errorMessage } from "../lib/api";
import { formatDate, shortAddress } from "../lib/format";
import { signAndSendContractCall } from "../lib/aurora";
import { REGISTRY_ABI } from "../lib/registry";

const RELATIONSHIPS = [
  { value: "SON", label: "Son" },
  { value: "DAUGHTER", label: "Daughter" },
  { value: "GRANDSON", label: "Grandson" },
  { value: "GRANDDAUGHTER", label: "Granddaughter" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "SIBLING", label: "Sibling" },
  { value: "OTHER", label: "Other / trusted friend" },
];

function RegistryBadge({ contact }) {
  if (contact.onchainStatus === "REGISTERED") {
    return (
      <Badge tone="green" icon={ShieldCheck}>
        Onchain approved
      </Badge>
    );
  }
  if (contact.onchainStatus === "NOT_REGISTERED") {
    return <Badge tone="gold">Not onchain</Badge>;
  }
  if (contact.onchainStatus === "UNKNOWN") {
    return <Badge tone="neutral">Registry unchecked</Badge>;
  }
  return <Badge tone="neutral">Registry not deployed</Badge>;
}

export default function Contacts() {
  const { toast } = useToast();
  const { config } = useConfig();
  const { wallet } = useWallet();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ name: "", relationship: "OTHER", walletAddress: "" });
  const [confirmingId, setConfirmingId] = useState(null);

  const registryConfigured = Boolean(config?.features?.onchainRegistry);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await endpoints.contacts();
      setContacts(data.contacts);
    } catch (err) {
      setError(errorMessage(err, "Contacts could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", relationship: "OTHER", walletAddress: "" });
    setFormError("");
    setOpen(true);
  }

  function openEdit(contact) {
    setEditing(contact);
    setForm({ name: contact.name, relationship: contact.relationship, walletAddress: contact.walletAddress });
    setFormError("");
    setOpen(true);
  }

  async function save(event) {
    event.preventDefault();
    setFormError("");
    if (!form.name.trim()) {
      setFormError("Please enter a name.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { data } = await endpoints.updateContact(editing.id, {
          name: form.name.trim(),
          relationship: form.relationship,
        });
        setContacts((current) => current.map((item) => (item.id === editing.id ? data.contact : item)));
        toast("Contact updated.", "success");
      } else {
        const { data } = await endpoints.createContact({
          name: form.name.trim(),
          relationship: form.relationship,
          walletAddress: form.walletAddress.trim(),
        });
        setContacts((current) => [data.contact, ...current]);
        toast("Contact saved. Check the address on chain before the first payment.", "success");
      }
      setOpen(false);
    } catch (err) {
      setFormError(errorMessage(err, "That contact could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function remove(contact) {
    if (!window.confirm(`Remove ${contact.name} from your trusted contacts?`)) return;
    try {
      await endpoints.deleteContact(contact.id);
      setContacts((current) => current.filter((item) => item.id !== contact.id));
      toast("Contact removed.", "success");
    } catch (err) {
      toast(errorMessage(err, "That contact could not be removed."), "error");
    }
  }

  async function refreshRegistry(contact) {
    try {
      const { data } = await endpoints.refreshRegistry(contact.id);
      setContacts((current) => current.map((item) => (item.id === contact.id ? data.contact : item)));
      toast("Registry status rechecked.", "success");
    } catch (err) {
      toast(errorMessage(err, "The registry could not be rechecked."), "error");
    }
  }

  /**
   * The registry approval is a real contract call, signed by the user's wallet.
   * We only mark the contact approved after the chain verifies the transaction.
   */
  async function approveOnchain(contact) {
    if (!wallet) {
      toast("Connect your wallet before approving a contact onchain.", "warning");
      return;
    }
    if (!registryConfigured || !config?.contractId) {
      toast("The SabiSafe registry contract is not deployed yet, so this step is unavailable.", "warning");
      return;
    }
    setConfirmingId(contact.id);
    try {
      const { hash } = await signAndSendContractCall({
        from: wallet.address,
        contractAddress: config.contractId,
        abi: REGISTRY_ABI,
        functionName: "addTrusted",
        args: [contact.walletAddress],
      });

      const { data } = await endpoints.confirmOnchain(contact.id, hash);
      setContacts((current) => current.map((item) => (item.id === contact.id ? data.contact : item)));
      toast("Contact approved by the onchain registry.", "success");
    } catch (err) {
      const message = String(err?.message || "");
      toast(
        /cancel|reject|closed|denied/i.test(message)
          ? "You cancelled the approval. Nothing changed."
          : errorMessage(err, "The onchain approval did not complete."),
        "error",
      );
    } finally {
      setConfirmingId(null);
    }
  }

  if (loading) return <PageLoader label="Loading your trusted contacts…" />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Trusted contacts"
        title="The people you check once"
        description="Saving an address makes future payments easier to read. It does not make the person honest, so still confirm before a large amount."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={load} icon={RefreshCw}>
              Refresh
            </Button>
            <Button size="sm" onClick={openCreate} icon={UserPlus}>
              Add contact
            </Button>
          </>
        }
      />

      {error ? (
        <Alert tone="danger" title="We could not load your contacts">
          {error}{" "}
          <button type="button" onClick={load} className="font-semibold underline">
            Try again
          </button>
        </Alert>
      ) : null}

      {!registryConfigured ? (
        <Alert tone="info" title="Onchain registry is optional">
          The trusted-recipient registry contract is not deployed in this environment. Local contacts still work. Once a
          contract ID is configured, you can approve a contact onchain from this page.
        </Alert>
      ) : null}

      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No saved contacts yet"
          description="Add a family member once. Then Send can show their name and warn you when an address is new."
          action={
            <Button onClick={openCreate} icon={UserPlus}>
              Add your first contact
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((contact) => (
            <Card key={contact.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[1.05rem] font-semibold text-ink">{contact.name}</p>
                  <p className="text-[0.78rem] uppercase tracking-wide text-muted">
                    {RELATIONSHIPS.find((item) => item.value === contact.relationship)?.label || contact.relationship}
                  </p>
                </div>
                <RegistryBadge contact={contact} />
              </div>

              <div className="mt-3 rounded-xl border border-line bg-cream px-3 py-2">
                <p className="break-all font-mono text-[0.8rem] text-ink">{contact.walletAddress}</p>
              </div>

              <p className="mt-2 text-[0.74rem] text-muted">
                Added {formatDate(contact.createdAt)}
                {contact.onchainCheckedAt ? ` · registry checked ${formatDate(contact.onchainCheckedAt)}` : ""}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(contact)}>
                  Edit name
                </Button>
                {registryConfigured ? (
                  contact.onchainStatus === "REGISTERED" ? (
                    <Button variant="ghost" size="sm" onClick={() => refreshRegistry(contact)} icon={RefreshCw}>
                      Recheck
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => approveOnchain(contact)}
                      loading={confirmingId === contact.id}
                      icon={Link2}
                    >
                      Approve onchain
                    </Button>
                  )
                ) : null}
                <Button variant="danger" size="sm" onClick={() => remove(contact)} icon={Trash2}>
                  Remove
                </Button>
              </div>

              {contact.onchainStatus === "REGISTERED" ? (
                <p className="mt-2 flex items-start gap-1.5 text-[0.74rem] leading-relaxed text-leaf">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  This address is recorded in the SabiSafe registry for your wallet.
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4">
        <p className="text-[0.85rem] font-semibold text-ink">Why an onchain registry?</p>
        <p className="mt-1 text-[0.83rem] leading-relaxed text-muted">
          The registry stores a public list of addresses you trust, under your own Aurora wallet. It helps other tools
          show the same trusted recipient, and it proves that you approved the address with your wallet — not with a
          database edit. Your approval is always a real transaction you sign yourself.
        </p>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit contact" : "Add a trusted contact"}
        description={editing ? "The wallet address cannot be changed here. Remove and add it again if it was wrong." : "Only save an address you have confirmed with the person directly."}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving} icon={Plus}>
              {editing ? "Save changes" : "Save contact"}
            </Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          {formError ? <Alert tone="danger">{formError}</Alert> : null}
          <Field label="Name" htmlFor="contact-name">
            <Input
              id="contact-name"
              required
              maxLength={80}
              placeholder="e.g. Ngozi"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </Field>
          <Field label="Relationship" htmlFor="contact-relationship">
            <Select
              id="contact-relationship"
              value={form.relationship}
              onChange={(event) => setForm((current) => ({ ...current, relationship: event.target.value }))}
            >
              {RELATIONSHIPS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Aurora testnet address"
            htmlFor="contact-address"
            hint={editing ? "Addresses are fixed. Remove the contact and add it again to correct it." : "Paste the exact 0x address from the person's own wallet app."}
          >
            <Input
              id="contact-address"
              required={!editing}
              disabled={Boolean(editing)}
              spellCheck={false}
              placeholder="e.g. 0x1234…abcd"
              value={form.walletAddress}
              onChange={(event) => setForm((current) => ({ ...current, walletAddress: event.target.value.trim() }))}
            />
          </Field>
          {!editing ? (
            <Alert tone="warning" title="Check it twice">
              A saved contact is a reminder, not a guarantee. If an address is wrong, a payment cannot be reversed.
              Ask the person to read the first and last six characters aloud.
            </Alert>
          ) : null}
        </form>
      </Modal>
    </div>
  );
}
