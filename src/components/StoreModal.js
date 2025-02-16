import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './StoreModal.css';
import { FaFacebookF, FaInstagram } from 'react-icons/fa'; // Importando os ícones


const StoreModal = ({ show, handleClose, storeConfig, storeDetails, storeImages }) => {
  return (
    <Modal show={show} onHide={handleClose} fullscreen="lg-down">
      <Modal.Header closeButton>

      </Modal.Header>

      <br />
      <div className='store-title'>
        {storeImages.map((image) => (
          <div key={image.id}>
            <img
              src={image.url}
              alt={`Foto da store ${storeDetails.namestore}`}
              style={{
                width: '700px',
                height: '700px',
                borderRadius: '50%',
                objectFit: 'cover',
                position: 'relative', // Mantém a imagem do logo acima da sobreposição
                zIndex: 2, // Imagem acima da sobreposição
              }}
            />
            <br />
            <h1>
              <Modal.Title style={{ cursor: 'pointer', fontFamily: "Kanit" }}>{storeDetails.namestore}</Modal.Title>
            </h1>
            {storeConfig.facebook && (
              <a href={storeConfig.facebook} target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', color: storeConfig.cor_primaria }}>
                <FaFacebookF size={24} />
              </a>)
            }
            {storeConfig.instagram && (
              <a href={storeConfig.instagram} target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', color: storeConfig.cor_primaria }}>
                <FaInstagram size={24} />
              </a>)}
          </div>
        ))}
      </div>
      <div className='store-info'>
        <br />
        <>
          {storeDetails.opening_hours && storeDetails.closing_hours && (
            <p>
              <strong>Horário de Funcionamento:</strong> {storeDetails.opening_hours} - {storeDetails.closing_hours}
            </p>
          )}
          {storeDetails.address && (
            <p>
              <strong>Endereço:</strong> {storeDetails.address}
            </p>
          )}
          {storeDetails.phone && (
            <p>
              <strong>Telefone:</strong> {storeDetails.phone}
            </p>
          )}
          {storeDetails.email && (
            <p>
              <strong>E-mail:</strong> {storeDetails.email}
            </p>
          )}
        </>


      </div>
      <Modal.Footer className='modal-footer'>
        <Button variant="secondary" onClick={handleClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StoreModal;
