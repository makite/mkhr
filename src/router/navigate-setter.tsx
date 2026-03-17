import { useEffect } from "react";
import { useNavigate } from "react-router";

import { setNavigate } from "@/lib/api";

export default function NavigateSetter() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;
}

