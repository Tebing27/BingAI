export async function validateUserAccess(ctx, userId) {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User tidak ditemukan");
  }
  return user;
}

export async function validateWorkspaceAccess(ctx, workspaceId, userId) {
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) {
    throw new Error("Workspace tidak ditemukan");
  }
  
  if (workspace.user !== userId) {
    throw new Error("Anda tidak memiliki akses ke workspace ini");
  }
  
  return workspace;
} 