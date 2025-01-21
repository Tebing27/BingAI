import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateWorkspaceAccess, validateUserAccess } from "./lib/auth";

export const CreateWorkspace=mutation({
    args:{
        messages:v.any(),
        user:v.id('users')
    },
    handler:async(ctx,args)=>{
        const workspaceId=await ctx.db.insert('workspace',{
            messages:args.messages,
            user:args.user
        });
        return workspaceId;
    }
})

export const GetWorkspace=query({
    args:{
        workspaceId: v.id('workspace'),
        userId: v.id('users')
    },
    handler:async(ctx,args)=>{
        // Validasi akses
        const workspace = await validateWorkspaceAccess(ctx, args.workspaceId, args.userId);
        return workspace;
    }
})

export const UpdateMessages=mutation({
    args:{
        workspaceId:v.id('workspace'),
        userId: v.id('users'),
        messages:v.any()
    },
    handler:async(ctx,args)=>{
        // Validasi akses
        await validateWorkspaceAccess(ctx, args.workspaceId, args.userId);
        
        const result=await ctx.db.patch(args.workspaceId,{
            messages:args.messages
        });
        return result
    }
})

export const UpdateFiles=mutation({
    args:{
        workspaceId: v.id('workspace'),
        userId: v.id('users'),
        files: v.any()
    },
    handler:async(ctx,args)=>{
        // Validasi akses
        await validateWorkspaceAccess(ctx, args.workspaceId, args.userId);
        
        const result=await ctx.db.patch(args.workspaceId,{
            fileData:args.files
        });
        return result;
    }
})

export const GetAllWorkspace=query({
    args:{
        userId: v.id('users')
    },
    handler:async(ctx,args)=>{
        // Validasi bahwa user exists
        await validateUserAccess(ctx, args.userId);
        
        const result=await ctx.db.query('workspace')
            .filter(q=>q.eq(q.field('user'),args.userId))
            .collect();
        return result;
    }
})
