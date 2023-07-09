import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { access_token, setAccessToken } = useAuth();

  return (
    <div className="flex flex-col items-center gap-10 ">
      <h1 className="text-6xl">Welcome!</h1>
      <p className="max-w-[550px] text-center text-lg">
        Ο ιστότοπός μας παρέχει μια πλατφόρμα για την αποθήκευση και εφαρμογή
        του αλγορίθμου DBSCAN (Density-Based Spatial Clustering of Applications
        with Noise) σε δεδομένα. Είναι ιδανικός για φοιτητές που αναζητούν ένα
        εργαλείο για την ανάλυση των δεδομένων τους και την εφαρμογή του
        αλγορίθμου DBSCAN. Επισκεφθείτε μας για να ανεβάσετε τα δεδομένα σας και
        να ανακαλύψετε τη δυνατότητα του αλγορίθμου DBSCAN για την εξαγωγή
        πληροφοριών από αυτά.
      </p>
    </div>
  );
};

export default Home;
