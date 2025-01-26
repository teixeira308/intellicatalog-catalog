import './ProductModal.css';
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';
import Form from 'react-bootstrap/Form';

const ProductModal = ({ show, handleClose, product, images, addToCart, storeStatus, storeConfigs }) => {
    const [quantity, setQuantity] = useState(1); // Estado para quantidade

    // Função para alterar a quantidade com base na entrada do usuário
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && (!storeConfigs.usa_estoque || storeConfigs.usa_estoque === "false" || value <= product.estoque)) { // Verifica se 'usa_estoque' é "true" ou "false"
            setQuantity(value);
        }
    };

    // Função para adicionar ao carrinho
    const handleAddToCart = () => {
        addToCart({ ...product, quantity }); // Adiciona o produto com a quantidade selecionada
        handleClose();
    };

    // Função para aumentar a quantidade
    const increaseQuantity = () => {
        if (!storeConfigs.usa_estoque || storeConfigs.usa_estoque === "false" || quantity < product.estoque) { // Impede que a quantidade ultrapasse o estoque se 'usa_estoque' for "true"
            setQuantity(prevQuantity => prevQuantity + 1);
        }
    };

    // Função para diminuir a quantidade
    const decreaseQuantity = () => {
        if (quantity > 1) { // Impede que a quantidade seja menor que 1
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} fullscreen='lg-down'>
            <Modal.Header closeButton> 
            </Modal.Header> 
            <div className="modal-content">
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

                    <h4> 
                        {product.promocional_price > 0 ? (
                            <>
                                <span style={{ textDecoration: 'line-through', color: 'red', fontSize: '14px' }}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                </span>
                                <br />
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
                        )}
                    </h4>
                    <p>{product.description}</p>
                    {storeConfigs.usa_estoque === "true" && (
                        <p>Estoque disponível: {product.estoque}</p> // Exibe a quantidade de estoque disponível se 'usa_estoque' for "true"
                    )}

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
            </div>
        </Modal>
    );
};

export default ProductModal;
