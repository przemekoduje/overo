import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";
import "./styles.scss";

import S1 from "./sections/S1";
import S2 from "./sections/S2";
import S3 from "./sections/S3";
import S4 from "./sections/S4";
import S5 from "./sections/S5";
import S6 from "./sections/S6";

// jeśli masz już stronę edytora:
import EditorPage from "./pages/EditorPage/EditorPage"; // <- albo zrób placeholder (niżej)

function Home() {
  return (
    <main className="page">
      <S1 />
      <S2 />
      <S3 />
      <S4 />
      <S5 />
      <S6 />
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<EditorPage />} />
        {/* ewentualnie szczegóły looku: /look/look1 */}
        {/* <Route path="/look/:imageId" element={<LookPage />} /> */}

        {/* fallback 404 → na stronę główną */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
