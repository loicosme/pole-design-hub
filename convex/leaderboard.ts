import { query } from "./_generated/server";

export const top = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("players")
      .withIndex("by_score")
      .order("desc")
      .take(20);
  },
});
