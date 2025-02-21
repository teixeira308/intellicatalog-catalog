import { Modal, Button } from 'react-bootstrap';
import { FaWhatsapp, FaTrashAlt } from "react-icons/fa";
import './CartModal.css';
const CartModal = ({ show, handleClose, cart, productImages, sendOrderToWhatsApp, setCart, store, storeConfigs, cartItemCount, setCartItemCount }) => {


    const total = cart.reduce((sum, item) => {
        const itemPrice = item.promocional_price ? parseFloat(item.promocional_price) : parseFloat(item.price);
        return sum + (isNaN(itemPrice) ? 0 : itemPrice * item.quantity);
    }, 0);

    // Adiciona a taxa de entrega apenas se calcula_taxa_entrega_posterior não for "true"
const deliveryFee = storeConfigs.calcula_taxa_entrega_posterior === "true" ? 0 : (parseFloat(storeConfigs.taxa_entrega) || 0);

const finalTotal = total + deliveryFee;


    const formattedTotal = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(finalTotal);


    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
        setCartItemCount(prevCount => prevCount - 1);
    };

    const updateQuantity = (productId, newQuantity) => {
        setCart(cart.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    return (
        <Modal show={show} onHide={handleClose} fullscreen="lg-down">
            <Modal.Header closeButton>
                <Modal.Title>Seu Carrinho</Modal.Title>
            </Modal.Header>
            <div className='cart-content'>
                {cart.length === 0 ? (
                    <p className='carrinhovazio'>O carrinho está vazio.</p>
                ) : (
                    <>
                        {cart.map((item, index) => (
                            <div key={index} className="cart-item">
                                {productImages[item.id] && productImages[item.id].length > 0 ? (
                                    <img
                                        src={productImages[item.id][0].url}
                                        alt={item.titulo}
                                        className="cart-item-image"
                                        onLoad={(e) => e.target.classList.add('loaded')}
                                        onError={(e) => e.target.classList.add('error')}
                                    />
                                ) : (
                                    <div className="placeholder">Sem imagem</div>
                                )}
                                <div className="cart-item-details">
                                    <h5>{item.titulo}</h5>
                                    <p>{item.promocional_price > 0 ? (
                                        <>
                                            <span style={{ textDecoration: 'line-through', color: 'red', fontSize: '10px' }}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                            </span>
                                            <br />
                                            <span>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.promocional_price)}
                                            </span>
                                            &nbsp;
                                            <span style={{ color: 'green' }}>
                                                ({Math.round(((item.price - item.promocional_price) / item.price) * 100)}% de desconto)
                                            </span>
                                        </>
                                    ) : (
                                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)
                                    )}</p>

                                    {/* Botões de incremento/decremento */}
                                    <div className="quantity-control">
                                        <div>
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            >
                                                -
                                            </Button>&nbsp;&nbsp;
                                            <span>{item.quantity}</span>&nbsp;&nbsp;
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </Button>
                                        </div>

                                    </div>


                                </div>
                                <Button variant="danger" onClick={() => removeFromCart(item.id)}>
                                    <FaTrashAlt />
                                </Button>
                            </div>
                        ))}


                    </>
                )}
            </div>

            <Modal.Footer>
                <div className="cart-total">
                    {cartItemCount > 0 && (
                        <>
                            {storeConfigs.calcula_taxa_entrega_posterior === "true" ? (
                                <h5>Taxa de envio a definir</h5>
                            ) : (
                                storeConfigs.taxa_entrega > 0 && <h5>Taxa entrega: R$ {storeConfigs.taxa_entrega}</h5>
                            )}
                            <h5>Total: {formattedTotal} / {cartItemCount} {cartItemCount === 1 ? " item" : " itens"}</h5>
                        </>
                    )}
                </div>

                <div className='buttons-cart'>
                    {cart.length > 0 ? (
                        <>
                            <Button onClick={handleClose} style={{ backgroundColor: storeConfigs.cor_botao_primaria, borderColor: storeConfigs.cor_botao_primaria, color: storeConfigs.cor_secundaria, width: "45%", height: "60px" }}>
                                Continuar comprando
                            </Button>
                            &nbsp;
                            <Button
                                variant="success"
                                onClick={sendOrderToWhatsApp} // Botão para enviar pedido se houver itens
                                style={{ width: "45%", height: "60px" }}
                            >
                                Enviar
                                <FaWhatsapp style={{ fontSize: '1.3em', marginLeft: '8px', marginTop: '-3px' }} />
                            </Button>
                        </>
                    ) : (
                        <Button variant="secondary" onClick={handleClose} style={{ backgroundColor: storeConfigs.cor_botao_primaria, borderColor: storeConfigs.cor_botao_primaria, color: storeConfigs.cor_secundaria, width: "45%", height: "60px" }}>
                            Selecione Produtos
                        </Button>
                    )}
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default CartModal;
