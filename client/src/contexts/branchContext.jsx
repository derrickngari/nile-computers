import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get("/branches");
        setBranches(res.data);

        const saved = localStorage.getItem("selectedBranch");
        if (saved) {
          const parsed = JSON.parse(saved);
          const found = res.data.find(b => b.id === parsed.id);
          setSelectedBranch(found || { id: "all", name: "All Branches", code: "ALL" });
        } else {
          setSelectedBranch({ id: "all", name: "All Branches", code: "ALL" });
        }
      } catch (error) {
        console.error("Failed to fetch branches:", error);
        // Fallback
        setSelectedBranch({ id: "all", name: "All Branches", code: "ALL" });
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const changeBranch = (branch) => {
    setSelectedBranch(branch);
  };

  return (
    <BranchContext.Provider value={{ 
      branches, 
      selectedBranch, 
      changeBranch, 
      loading 
    }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => useContext(BranchContext);