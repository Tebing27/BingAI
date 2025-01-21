import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateUser=mutation({
    args:{
        name:v.string(),
        email:v.string(),
        picture:v.string(),
        uid:v.string()
    },
    handler:async(ctx,args)=>{
        const user=await ctx.db.query('users')
            .filter((q)=>q.eq(q.field('email'),args.email))
            .collect();
            
        if(user?.length==0){
            const result=await ctx.db.insert('users',{
                name:args.name,
                picture:args.picture,
                email:args.email,
                uid:args.uid,
                token:20,
                lastTokenReset: Date.now(),
                generationCount: 0
            });
            return result;
        }
    }
})

export const GetUser=query({
    args:{
        email:v.string()
    },
    handler:async(ctx,args)=>{
        const user=await ctx.db.query('users').filter((q)=>q.eq(q.field('email'),args.email)).collect()
        return user[0];
    }
})

export const UpdateTokens=mutation({
    args:{
        token:v.number(),
        userId:v.id('users')
    },
    handler:async(ctx,args)=>{
        const result=await ctx.db.patch(args.userId,{
            token:args.token
        })
        return result;
    }
})

export const ResetDailyTokens=mutation({
    args:{
        userId:v.id('users')
    },
    handler:async(ctx,args)=>{
        const user = await ctx.db.get(args.userId);
        const oneDayInMs = 24 * 60 * 60 * 1000;
        
        if (Date.now() - user.lastTokenReset >= oneDayInMs) {
            return await ctx.db.patch(args.userId, {
                token: 20,
                lastTokenReset: Date.now(),
                generationCount: 0
            });
        }
        return user;
    }
})

export const UpdateUser = mutation({
    args: {
        userId: v.id('users'),
        name: v.string(),
        picture: v.string()
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.patch(args.userId, {
            name: args.name,
            picture: args.picture
        });
        return result;
    }
});

export const DeleteUser = mutation({
    args: {
        userId: v.id('users')
    },
    handler: async (ctx, args) => {
        // Hapus semua workspace user
        const workspaces = await ctx.db
            .query('workspace')
            .filter(q => q.eq(q.field('user'), args.userId))
            .collect();
            
        for (const workspace of workspaces) {
            await ctx.db.delete(workspace._id);
        }

        // Hapus user
        await ctx.db.delete(args.userId);
        return true;
    }
});