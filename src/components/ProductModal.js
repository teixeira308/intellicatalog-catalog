import './ProductModal.css';
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';
import Form from 'react-bootstrap/Form';

const ProductModal = ({ show, handleClose, product, images, addToCart, storeStatus, storeConfigs }) => {
    const [quantity, setQuantity] = useState(1); // Estado para quantidade

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0) {
            setQuantity(value);
        }
    };

    const handleAddToCart = () => {
        addToCart({ ...product, quantity }); // Adiciona o produto com a quantidade selecionada
        handleClose();
    };


    const increaseQuantity = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} fullscreen='lg-down'>

            <Modal.Header closeButton>
               
            </Modal.Header>


            {images.length > 0 ? (
                <Carousel>
                    {images.map((img, idx) => (
                        <Carousel.Item key={idx}>
                            <img
                                className="image-gallery"
                                src={img.url}
                                alt={product.titulo}
                            />
                        </Carousel.Item>
                    ))}
                </Carousel>
            ) : (
                <div className="semimagem">Sem imagens disponíveis</div>
            )}
            <div className='product-info'>
                <h1>{product.titulo}</h1>
                <h4>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}</h4>
                <p>{product.description}</p>


            </div>

           
                <Modal.Footer className="modal-footer">
                    {storeStatus === "Aberta" ? (
                        <>
                            <Form.Group controlId="productQuantity">
                                <div className="quantity-control">

                                    <Button variant="light" onClick={decreaseQuantity}>-</Button>
                                    <span>  {quantity}  </span>
                                    <Button variant="light" onClick={increaseQuantity}>+</Button>
                                </div>
                            </Form.Group>
                            <Button onClick={handleAddToCart} style={{ backgroundColor: storeConfigs.cor_botao_primaria, borderColor: storeConfigs.cor_botao_primaria, color: 'black' }}>
                                Adicionar ao Carrinho
                            </Button>

                        </>
                    ) : (
                        <Button variant="secondary" onClick={handleClose}>
                            Fechar
                        </Button>
                    )}
                </Modal.Footer>

           
        </Modal>
    );
};

export default ProductModal;
