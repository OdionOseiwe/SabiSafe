export function publicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    email: user.email,
    preferredLanguage: user.preferredLanguage,
    experienceLevel: user.experienceLevel,
    assistanceMode: user.assistanceMode,
    saveAiHistory: user.saveAiHistory,
    onboarded: Boolean(user.onboardedAt),
    createdAt: user.createdAt,
  };
}

export function publicContact(contact) {
  return {
    id: contact.id,
    name: contact.name,
    relationship: contact.relationship,
    walletAddress: contact.walletAddress,
    network: contact.network,
    onchainStatus: contact.onchainStatus,
    onchainCheckedAt: contact.onchainCheckedAt,
    createdAt: contact.createdAt,
  };
}

export function publicTransaction(txn) {
  return {
    id: txn.id,
    hash: txn.transactionHash,
    sender: txn.senderAddress,
    recipient: txn.recipientAddress,
    amountWei: txn.amountWei,
    asset: txn.asset,
    network: txn.network,
    status: txn.status,
    direction: txn.direction,
    blockHeight: txn.blockHeight,
    failureReason: txn.failureReason,
    verifiedAt: txn.verifiedAt,
    explorerUrl: txn.explorerUrl,
    source: txn.source,
    createdAt: txn.createdAt,
  };
}

export function publicReceivingRequest(request, { shareUrl } = {}) {
  return {
    id: request.id,
    payerName: request.payerName,
    recipientAddress: request.recipientAddress,
    amountWei: request.amountWei,
    asset: request.asset,
    network: request.network,
    note: request.note,
    status: request.status,
    createdAt: request.createdAt,
    ...(shareUrl ? { shareUrl } : {}),
  };
}
