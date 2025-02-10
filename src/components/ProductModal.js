import './ProductModal.css';
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';
import Form from 'react-bootstrap/Form';

const ProductModal = ({ show, handleClose, product, images, addToCart, storeStatus, storeConfigs }) => {
    const [quantity, setQuantity] = useState(1);
    const [showFullImage, setShowFullImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && (!storeConfigs.usa_estoque || storeConfigs.usa_estoque === "false" || value <= product.estoque)) {
            setQuantity(value);
        }
    };

    const handleAddToCart = () => {
        addToCart({ ...product, quantity });
        handleClose();
    };

    const increaseQuantity = () => {
        if (!storeConfigs.usa_estoque || storeConfigs.usa_estoque === "false" || quantity < product.estoque) {
            setQuantity(prevQuantity => prevQuantity + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    const openFullImage = (imgUrl) => {
        setSelectedImage(imgUrl);
        setShowFullImage(true);
    };

    return (
        <>
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
                                        onClick={() => openFullImage(img.url)}
                                        style={{ cursor: "pointer" }}
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
                            <p><b>Estoque disponível:</b> {product.estoque}</p>
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

            {/* Modal de imagem em tela cheia */}
            {/* Modal de imagem em tela cheia */}
            <Modal show={showFullImage} onHide={() => setShowFullImage(false)} fullscreen>
                <Modal.Body
                    style={{
                        backgroundColor: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        padding: 0
                    }}
                >
                    <Button
                        variant="light"
                        onClick={() => setShowFullImage(false)}
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            fontSize: '2rem',
                            color: 'white',
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: 'none',
                            padding: '5px 15px',
                            borderRadius: '50%',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </Button>
                    <img
                        src={selectedImage}
                        alt="Imagem ampliada"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100vh',
                            objectFit: 'contain'
                        }}
                    />
                </Modal.Body>
            </Modal>

        </>
    );
};

export default ProductModal;
