/* eslint-disable react-hooks/purity */

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { Id } from "../../../../convex/_generated/dataModel";

export const useProject = (projectId: Id<"projects">) => { return useQuery(api.projects.getById, { id: projectId }); };

export const useProjects = () => {
    return useQuery(api.projects.get);
};

export const useProjectsPartial = (limit: number) => {
    return useQuery(api.projects.getPartial, { limit, });
};

export const useCreateProject = () => {

    const { userId } = useAuth();

    return useMutation(api.projects.create).withOptimisticUpdate(
        (localStore, args) => {

            const existingProjects = localStore.getQuery(api.projects.get);

            if (existingProjects !== undefined) {

                const now = Date.now();
                const newProject = {
                    _id: crypto.randomUUID() as Id<"projects">,
                    _creationTime: now,
                    name: args.name,
                    ownerId: userId ?? "",
                    updatedAt: now,
                    importStatus: args.importStatus,
                    exportStatus: args.exportStatus,


                };

                localStore.setQuery(api.projects.get, {}, [newProject, ...existingProjects,]); // CHECK FOR THE ERROR HERE
            }
        }
    );
};


export const useRenameProject = (projectId: Id<"projects">) => {

    return useMutation(api.projects.rename).withOptimisticUpdate(
        (localStore, args) => {

            const existingProject = localStore.getQuery(api.projects.getById, { id: projectId });

            if (existingProject !== undefined && existingProject !== null) { localStore.setQuery(api.projects.getById, { id: projectId }, { ...existingProject, name: args.name, updatedAt: Date.now(), }); }// CHECK FOR THE ERROR HERE };

            const existingProjects = localStore.getQuery(api.projects.get);

            if (existingProjects !== undefined) {
                localStore.setQuery(api.projects.get, {}, existingProjects.map((project) => {
                    return project._id === args.id ? { ...project, name: args.name, updatedAt: Date.now() } : project
                }))
            }


        }
    );
};