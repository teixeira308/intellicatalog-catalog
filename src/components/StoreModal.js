import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './StoreModal.css';

const StoreModal = ({ show, handleClose, storeDetails }) => {
  return (
    <Modal show={show} onHide={handleClose} className='modal-content' fullscreen='lg-down'>
      <Modal.Header closeButton>
        <Modal.Title style={{ cursor: 'pointer' , fontFamily: "Kanit" }}>{storeDetails.namestore}</Modal.Title>
      </Modal.Header>
     <div className='store-info'>
        <p><strong>Horário de Funcionamento:</strong> {storeDetails.opening_hours} - {storeDetails.closing_hours}</p>
        <p><strong>Endereço:</strong> {storeDetails.address}</p>
        <p><strong>Telefone:</strong> {storeDetails.phone}</p>
        <p><strong>E-mail:</strong> {storeDetails.email}</p>
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
