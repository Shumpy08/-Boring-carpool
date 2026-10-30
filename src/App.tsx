import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyTrips from "./pages/MyTrips";
import NotFound from "./pages/NotFound";
import OfferRide from "./pages/OfferRide";
import Safety from "./pages/Safety";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/offer" element={<OfferRide />} />
        <Route path="/trips" element={<MyTrips />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" closeButton toastOptions={{ style: { background: "#fbfbf8", color: "#54453f", border: "1px solid rgba(84,69,63,.18)" } }} />
    </>
  );
}
