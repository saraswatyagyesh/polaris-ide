const ProjectIdPage = async ({ params, }: { params: Promise<{ projectId: string }> }) => {
    const { projectId } = await params;

    return (
        <div className="w-full h-screen flex flex-col">
            Project ID: {projectId}
        </div>
    );
};

export default ProjectIdPage;