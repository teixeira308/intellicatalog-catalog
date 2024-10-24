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
                <h1>{product.titulo} - {product.brand}</h1>
                
                <h4> {product.promocional_price ? (
                                <>
                                  <span style={{ textDecoration: 'line-through', color: 'red', fontSize: '14px' }}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                  </span>
                                  <br/>
                                  <span>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.promocional_price)}
                                  </span>
                                  &nbsp;
                                  <span style={{ color: 'green' }}>
                                    ({Math.round(((product.price - product.promocional_price) / product.price) * 100)}% de desconto)
                                  </span>
                                </>
                              ) : (
                                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
                              )}</h4>
                <p>{product.description}</p>


            </div>

           
                <Modal.Footer className="modal-footer">
                    {storeStatus === "Aberta" ? (
                        <>
                            <Form.Group controlId="productQuantity">
                            <div className="d-flex align-items-center">

                                    <Button variant="outline-secondary" onClick={decreaseQuantity}>-</Button>
                                    &nbsp; &nbsp;{quantity}   &nbsp;&nbsp;
                                    <Button variant="outline-secondary" onClick={increaseQuantity}>+</Button>
                                </div>
                            </Form.Group>
                            <Button onClick={handleAddToCart} style={{ backgroundColor: storeConfigs.cor_botao_primaria, borderColor: storeConfigs.cor_botao_primaria, color: storeConfigs.cor_secundaria }}>
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
