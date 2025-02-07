import React, { useRef, useState } from "react";
import Modal from "./Modal";

const FormPengecekanProposal = () => {
  const modalRef = useRef();
  const [status, setStatus] = useState("");
  const [komentar, setKomentar] = useState("");

  const handleOpenModal = () => {
    modalRef.current.open();
  };

  const handleSimpan = () => {
    alert(`Status: ${status}\nKomentar: ${komentar}`);
    modalRef.current.close();
  };

  return (
    <div style={{ padding: "20px" }}>
      <button className="btn btn-primary" onClick={handleOpenModal}>
        Buka Form Pengecekan Proposal
      </button>

      <Modal
        ref={modalRef}
        title="Form Proses Pengecekan Proposal"
        size="medium"
        Button1={
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSimpan}
          >
            Simpan
          </button>
        }
        Button2={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => modalRef.current.close()}
          >
            Batal
          </button>
        }
      >
        <div>
          <label>Apakah proposal ini sudah sesuai?</label>
          <div style={{ marginBottom: "10px" }}>
            <label>
              <input
                type="radio"
                name="status"
                value="Diterima"
                checked={status === "Diterima"}
                onChange={() => setStatus("Diterima")}
              />{" "}
              Diterima
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="status"
                value="Direvisi"
                checked={status === "Direvisi"}
                onChange={() => setStatus("Direvisi")}
              />{" "}
              Direvisi
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="status"
                value="Ditolak"
                checked={status === "Ditolak"}
                onChange={() => setStatus("Ditolak")}
              />{" "}
              Ditolak
            </label>
          </div>

          <label htmlFor="komentar">
            Komentar <span style={{ color: "red" }}>*</span>
          </label>
          <textarea
            id="komentar"
            rows="4"
            value={komentar}
            onChange={(e) => setKomentar(e.target.value)}
            placeholder="Masukkan komentar Anda..."
            style={{
              width: "100%",
              borderRadius: "5px",
              padding: "8px",
              border: "1px solid #ccc",
            }}
            required
          ></textarea>
        </div>
      </Modal>
    </div>
  );
};

export default FormPengecekanProposal;
