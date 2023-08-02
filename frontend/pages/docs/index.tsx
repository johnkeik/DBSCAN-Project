const Docs = () => {
  return (
    <div className="flex flex-col items-start min-h-screen bg-fixed bg-center bg-cover custom-background-img relative">
      <iframe
        src="http://localhost:8081/api-docs"
        className="min-h-screen pt-[77px] w-full"
        title="API Documentation"
      />
    </div>
  );
};

export default Docs;
