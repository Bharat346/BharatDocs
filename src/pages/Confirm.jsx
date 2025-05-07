import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Confirm = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleConfirm = () => {
    const secret = import.meta.env.VITE_ADMIN_PASSWORD;

    if (password === secret) {
      localStorage.setItem("isAdminVerified", "true");
      navigate("/admin/dashboard");
    } else {
      alert("❌ Incorrect password!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-6 rounded-xl shadow-lg bg-white space-y-4 w-full max-w-sm">
        <h2 className="text-xl font-bold text-center">🔐 Admin Access</h2>
        <Input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
        />
        <Button className="w-full" onClick={handleConfirm}>
          Confirm Access
        </Button>
      </div>
    </div>
  );
};

export default Confirm;
