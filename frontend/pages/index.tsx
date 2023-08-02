import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { access_token, setAccessToken } = useAuth();

  return (
    <div className="flex flex-col items-start pt-[200px] min-h-screen bg-fixed bg-center bg-cover custom-background-img relative">
      <div className="flex flex-col items-start gap-10 ml-28">
        <h1 className="text-6xl text-white">Welcome!</h1>
        <p className="max-w-[550px] text-left text-lg text-white">
          Ο ιστότοπός μας παρέχει μια πλατφόρμα για την αποθήκευση και εφαρμογή
          του αλγορίθμου DBSCAN (Density-Based Spatial Clustering of
          Applications with Noise) σε δεδομένα. Είναι ιδανικός για φοιτητές που
          αναζητούν ένα εργαλείο για την ανάλυση των δεδομένων τους και την
          εφαρμογή του αλγορίθμου DBSCAN. Επισκεφθείτε μας για να ανεβάσετε τα
          δεδομένα σας και να ανακαλύψετε τη δυνατότητα του αλγορίθμου DBSCAN
          για την εξαγωγή πληροφοριών από αυτά.
        </p>
      </div>
    </div>
  );
};

export default Home;
