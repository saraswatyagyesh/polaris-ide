"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

const X = () => {

  const projects = useQuery(api.projects.get);
  const createProject = useMutation(api.projects.create);

  return (
    <div>
      <Button>
        Polaris IDE
      </Button>

      <div className="flex flex-col gap-3 p-4">

        <div className="flex gap-2">
          <Button onClick={() => createProject({ name: "New project" })}>Add new</Button>
          <Button asChild>
            <Link href="/api/demo">Go to Demo</Link>
          </Button>
        </div>

        {projects?.map((projects) => (
          <div className="border rounded p-2 flex flex-col" key={projects._id}>
            <p>{projects.name}</p>
            <p>Owner Id: {projects.ownerId}</p>
            <p>Import Status: {projects.importStatus}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default X;