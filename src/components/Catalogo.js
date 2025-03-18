import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Catalogo.css';
import axios from 'axios';
import StoreModal from './StoreModal';
import ProductModal from './ProductModal';
import CartModal from './CartModal';
import { useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa';
import loadingGif from '../components/loading.gif'

function Catalogo() {
  const [activeTab, setActiveTab] = useState(''); //controle de estado de guia ativa
  const [categories, setCategories] = useState([]);  //estado para categorias
  const [products, setProducts] = useState({}); //estado para produtos e suas infos
  const [productImages, setProductImages] = useState({}); //estado para imagens de produtos
  const [storeDetails, setStoreDetails] = useState({}); //estado para infos da store
  const [showModal, setShowModal] = useState(false); //estado para modal Store
  const { capturedValue } = useParams(); //identificador externo informado na URL
  const [cart, setCart] = useState([]); // Estado para o carrinho
  const [showCartModal, setShowCartModal] = useState(false); // Estado para o modal do carrinho
  const [selectedProduct, setSelectedProduct] = useState(null); // Estado para o produto selecionado
  const [showProductModal, setShowProductModal] = useState(false); // Estado para controle do modal
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const [imageStoreUrls, setImageStoreUrls] = useState([]);
  const [configStore, setConfigStore] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);

  const [loading, setLoading] = useState(true);


  //busca token no env
  const apiToken = process.env.REACT_APP_API_TOKEN;
  const api_url = process.env.REACT_APP_API_URL;

  const handleOpenCartModal = () => {
    setShowCartModal(true);
  };

  const handleCloseCartModal = () => setShowCartModal(false);

  const total = cart.reduce((sum, item) => {
    const itemPrice = item.promocional_price ? parseFloat(item.promocional_price) : parseFloat(item.price);
    return sum + (isNaN(itemPrice) ? 0 : itemPrice * item.quantity);
  }, 0);

  // Adiciona a taxa de entrega apenas se calcula_taxa_entrega_posterior não for "true"
  const deliveryFee = configStore.calcula_taxa_entrega_posterior === "true" ? 0 : (parseFloat(configStore.taxa_entrega) || 0);

  const finalTotal = total + deliveryFee;

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(finalTotal);

  const updateCartItemCount = (cart) => {
    const totalItems = cart.reduce((count, item) => count + item.quantity, 0);
    setCartItemCount(totalItems);
  };

  useEffect(() => {
    updateCartItemCount(cart);
  }, [cart]);




  const addToCart = (product) => {
    setCart((prevCart) => {
      const cartCopy = [...prevCart];

      const productIndex = cartCopy.findIndex(item => item.id === product.id);

      if (productIndex !== -1) {
        // Se o produto já existe, atualiza a quantidade somando a quantidade selecionada
        cartCopy[productIndex] = {
          ...cartCopy[productIndex],
          quantity: cartCopy[productIndex].quantity + product.quantity
        };
      } else {
        // Se o produto não existe, adiciona-o com a quantidade selecionada
        cartCopy.push({ ...product });
      }

      return cartCopy;
    });
  };


  const handleClickWhatsappNoOrder = (e) => {
    e.preventDefault();

    const numeroWhatsapp = configStore.numero_whatsapp?.replace(/\D/g, ""); // Remove caracteres não numéricos
    if (!numeroWhatsapp) {
      console.error("Número do WhatsApp não definido!");
      return;
    }

    const message = "Olá! Gostaria de saber mais sobre seus produtos.";

    // Detecta se está em um celular
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Escolhe a URL apropriada
    const whatsappApiUrl = isMobile
      ? `whatsapp://send?phone=${numeroWhatsapp}&text=${encodeURIComponent(message)}`
      : `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(message)}`;

    // Abre o WhatsApp corretamente para cada caso
    if (isMobile) {
      window.location.href = whatsappApiUrl; // Abre diretamente no app do WhatsApp no celular
    } else {
      window.open(whatsappApiUrl, "_blank", "noopener,noreferrer"); // Abre WhatsApp Web em uma nova aba no desktop
    }
  };


  const sendOrderToWhatsApp = async () => {
    // Formata os itens do carrinho
    const formattedItems = cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: parseFloat(item.price),
      total_price: parseFloat(item.price) * item.quantity,
    }));

    // Calcula o total do pedido
    const totalOrder = cart.reduce(
      (total, item) => total + parseFloat(item.price) * item.quantity,
      0
    );

    // Monta o objeto `pedido`
    const pedido = {
      user_id: storeDetails.user_id,
      total_amount: totalOrder,
      phone: "pendente confirmação",
      delivery_address: "pendente confirmação",
      notes: "pedido enviado por whatsapp, pendente confirmação",
      items: formattedItems,
    };

    let newPedido;
    try {
      const response = await axios.post(`${api_url}/intellicatalog/v1/orders`, pedido, {
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      });
      newPedido = response.data.id;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    }

    // Gera a mensagem do pedido
    const orderDetails = cart.map((item) => {
      const { titulo, price, quantity } = item;
      const unitPrice = Number(price);
      const totalItem = unitPrice * quantity;
      return `Produto: ${titulo}\nPreço unitário: R$${unitPrice.toFixed(2)}\nQuantidade: ${quantity}\nTotal: R$${totalItem.toFixed(2)}\n\n`;
    });

    const message = encodeURIComponent(
      `Detalhes do pedido #${newPedido}:\n\n${orderDetails.join("")}\nValor total do pedido: R$${totalOrder.toFixed(2)}`
    );

    // Detecta se está em um celular
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Escolhe a URL apropriada
    const whatsappApiUrl = isMobile
      ? `whatsapp://send?phone=${configStore.numero_whatsapp}&text=${message}`
      : `https://wa.me/${configStore.numero_whatsapp}?text=${message}`;

    // Abre o WhatsApp corretamente para cada caso
    if (isMobile) {
      window.location.href = whatsappApiUrl; // Abre o app diretamente no celular
    } else {
      window.open(whatsappApiUrl, "_blank"); // Abre o WhatsApp Web em uma nova aba no desktop
    }

    // Limpa o carrinho
    setCart([]);
    setCartItemCount(0);
    handleCloseCartModal();
  };

  const fetchCategories = async (storeId) => {
    try {
      const response = await axios.get(`${api_url}/intellicatalog/v1/categories/users/${storeId}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      });
      setCategories(response.data.data);
      if (response.data.data.length > 0) {
        setActiveTab(`categoria${response.data.data[0].id}`);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  useEffect(() => {
    // Essa parte irá definir a categoria ativa após as categorias serem carregadas
    if (categories.length > 0) {
      const firstCategoryId = `categoria${categories[0].id}`; // Pega a primeira categoria carregada
      setActiveTab(firstCategoryId); // Define a primeira categoria como ativa
    }
  }, [categories]);

  const fetchStoreDetails = async (identificadorExterno) => {

    try {
      const response = await axios.get(`${api_url}/intellicatalog/v1/stores/${identificadorExterno}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      });
      setStoreDetails(response.data);

    } catch (error) {
      console.error('Erro ao buscar detalhes da loja:', error);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const response = await axios.get(`${api_url}/intellicatalog/v1/products/category/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      });
      setProducts(prevState => ({
        ...prevState,
        [categoryId]: response.data.data
      }));
      // Carregar imagens após buscar produtos
      await loadProductImages(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar produtos da categoria:', error);
    }
  };


  const getFotoByProduto = async (product) => {

    const response = await fetch(`${api_url}/intellicatalog/v1/products/${product.id}/products_images`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar imagens do produto");
    }
    return await response.json();
  };


  const getStoreConfigs = async (store) => {

    const response = await fetch(`${api_url}/intellicatalog/v1/stores/${store.id}/config`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar imagens do produto");
    }
    return await response.json();
  };



  const getFotoProdutoDownload = async (product, photo) => {
    const response = await fetch(`${api_url}/intellicatalog/v1/products/${product.id}/products_images/download?arquivo=${photo.nomearquivo}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`
      }
    });

    if (!response.ok) {
      throw new Error("Erro ao fazer download da imagem");
    }

    const arrayBuffer = await response.arrayBuffer();
    // Converte o ArrayBuffer para Blob, certificando-se de usar o tipo correto de imagem
    const blob = new Blob([arrayBuffer], { type: "image/png" });
    return blob; // Retorna o Blob
  };

  const getFotoStoreDownload = async (store, photo) => {

    const response = await fetch(`${api_url}/intellicatalog/v1/stores/${store.id}/store_images/download?arquivo=${photo.nomearquivo}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`
      }
    });

    if (!response.ok) {
      throw new Error("Erro ao fazer download da imagem");
    }

    const arrayBuffer = await response.arrayBuffer();
    // Converte o ArrayBuffer para Blob, certificando-se de usar o tipo correto de imagem
    const blob = new Blob([arrayBuffer], { type: "image/png" });
    return blob; // Retorna o Blob
  };

  const getFotoByStoreId = async (store) => {

    const response = await fetch(`${api_url}/intellicatalog/v1/stores/${store.id}/store_images`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar imagens da store");
    }

    return await response.json();
  }


  // Função para carregar as imagens do stores do usuario
  const loadStoreImages = async (store) => {
    if (store) {
      try {
        const fotos = await getFotoByStoreId(store); // Busca todas as fotos do usuario

        // Gera URLs para cada imagem junto com o ID
        const fotosUrls = await Promise.all(
          fotos.map(async (foto) => {
            const arrayBuffer = await getFotoStoreDownload(store, foto);
            const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
            const url = URL.createObjectURL(blob); // Cria a URL a partir do Blob
            return { id: foto.id, url, store_id: foto.store_id }; // Retorna um objeto com o ID e a URL
          })
        );
        setImageStoreUrls(fotosUrls); // Define todas as URLs das imagens

      } catch (error) {
        console.error("Erro ao buscar fotos:", error);
      }
    }
  };

  const loadStoreConfigs = async (store) => {
    if (store) {
      try {
        const configs = await getStoreConfigs(store);
        setConfigStore(configs)
      } catch (error) {
        console.error("Erro ao buscar fotos:", error);
      }
    }
  };

  const loadProductImages = async (products) => {
    const newImages = {};

    if (products.length === 0) {
      setLoading(false);  // Garantir que o loading seja desligado, mesmo sem produtos
      return;
    }

    await Promise.all(
      products.map(async (product) => {
        const fotos = await getFotoByProduto(product); // Busca as fotos do produto
        const fotosUrls = await Promise.all(
          fotos.map(async (foto) => {
            const blob = await getFotoProdutoDownload(product, foto);
            if (blob) {
              const url = URL.createObjectURL(blob); // Cria a URL do Blob
              return { id: foto.id, url };
            }
            return null;
          })
        );
        newImages[product.id] = fotosUrls.filter(Boolean); // Adiciona as URLs válidas

        setLoading(false)
      })
    );

    setProductImages((prevImages) => ({
      ...prevImages,
      ...newImages, // Mescla as novas imagens com as existentes
    }));

  };

  useEffect(() => {
    if (cart.length > 0) {
      loadProductImages(cart);
    }
  }, [cart]);


  useEffect(() => {
    //console.log('Valor capturado:', capturedValue);

  }, [capturedValue]);

  useEffect(() => {
    fetchStoreDetails(capturedValue);

  }, [capturedValue]);

  useEffect(() => {
    if (storeDetails && Object.keys(storeDetails).length > 0 && storeDetails.user_id) {
      loadStoreConfigs(storeDetails);
      loadStoreImages(storeDetails);
      fetchCategories(storeDetails.user_id);
    }

  }, [storeDetails]);

  useEffect(() => {

    if (activeTab) {
      const categoryId = parseInt(activeTab.replace('categoria', ''));
      fetchProductsByCategory(categoryId);
    }
  }, [activeTab]);

  const handleOpenProductModal = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
    setShowProductModal(false);
  };

  useEffect(() => {
    if (imageStoreUrls.length > 0) {
      const favicon = document.querySelector("link[rel='icon']");
      if (favicon) {
        favicon.href = imageStoreUrls[0].url; // Usa a primeira imagem como favicon
      } else {
        const newFavicon = document.createElement("link");
        newFavicon.rel = "icon";
        newFavicon.href = imageStoreUrls[0].url;
        document.head.appendChild(newFavicon);
      }
    }
  }, [imageStoreUrls]); // Executa sempre que as imagens mudarem

  useEffect(() => {
    if (storeDetails?.namestore) {

    }
  }, [storeDetails?.namestore]); // Reexecuta quando o nome da loja mudar


  return (
    <div className="App">
      {loading ? (
        <div className="loading-screen">
          {/* Exibir tela de carregamento */}
          <img src={loadingGif} alt="Carregando..." />
        </div>
      ) : (
        <>
          <header
            className="text-white text-center"
            style={{
              backgroundImage: configStore.usa_logo_fundo === "true"
                ? `url(${imageStoreUrls[0]?.url})`  // Se usa_logo_fundo for "true", usa a imagem
                : `none`, // Se não, não define nenhuma imagem de fundo
              backgroundColor: configStore.usa_logo_fundo === "true"
                ? 'transparent' // Se usa_logo_fundo for "true", a cor de fundo deve ser transparente
                : configStore.cor_primaria, // Se não, usa a cor primária
              backgroundSize: '120%', // Aumenta o tamanho da imagem para criar efeito de zoom
              backgroundPosition: 'center', // Centraliza a imagem
              backgroundRepeat: 'no-repeat', // Impede a repetição da imagem
              position: 'relative', // Necessário para o posicionamento do pseudo-elemento
              color: 'white', // Para garantir que o texto fique legível
            }}
          >
            <div
              style={{
                position: 'absolute', // Posiciona o pseudo-elemento em relação ao cabeçalho
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: configStore.usa_logo_fundo === "true"
                  ? 'rgba(0, 0, 0, 0.5)' // Cor escura com opacidade
                  : `none`,
                zIndex: 1, // Coloca a sobreposição acima do fundo
              }}
              onClick={handleOpenModal}
            />
            {imageStoreUrls.map((image) => (
              <div key={image.id} onClick={handleOpenModal}>
                <img
                  src={image.url}

                  alt={`Foto da store ${storeDetails.namestore}`}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    position: 'relative', // Mantém a imagem do logo acima da sobreposição
                    zIndex: 2, // Imagem acima da sobreposição
                  }}
                />
                <br />
                <h1 style={{ cursor: 'pointer', fontFamily: 'Kanit', zIndex: 2, color: 'white', position: 'relative' }}>
                  {storeDetails.namestore}
                </h1>
              </div>
            ))}
            <div style={{ zIndex: 2, position: 'relative', marginTop: '10px' }}>
              {configStore.facebook && (
                <a href={configStore.facebook} target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', color: configStore.cor_secundaria }}>
                  <FaFacebookF size={24} />
                </a>
              )}
              {configStore.instagram && (
                <a href={configStore.instagram} target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', color: configStore.cor_secundaria }}>
                  <FaInstagram size={24} />
                </a>
              )}
            </div>
          </header>
          <main className="my main-content">
            <section>
              <div className="persisti">
                <div className='nav-tabs-responsive'>
                  <ul className='nav nav-tabs w-100 d-flex' role='tablist' style={{ margin: 0, padding: 0, borderBottom: "none", display: "flex", justifyContent: "space-between" }}>
                    {categories.sort((a, b) => a.catalog_order - b.catalog_order).map((category, index) => (
                      <li className="nav-item text-center flex-fill" key={index} style={{ flex: "1", display: "flex", justifyContent: "center" }}>
                        <a
                          className="nav-link"
                          href={`#categoria${category.id}`} // Link âncora
                          style={{
                            border: "none",
                            backgroundColor: "transparent",
                            color: configStore.cor_botao_secundaria,
                            textDecoration: "none",
                            fontWeight: "bold",
                            padding: "10px 15px",
                            width: "100%",
                          }}
                        >
                          {category.name}
                        </a>
                      </li>
                    ))}
                  </ul>

                </div>
              </div>
              <div className='tab-content'>
                {categories.length === 0 ? (
                  <div className="text-center my-5">
                    <h4>Não há categorias incluídas.</h4>
                  </div>
                ) : (
                  categories.map((category, index) => (
                    <div className='items-catalogo'>
                    {categories.sort((a, b) => a.catalog_order - b.catalog_order).map((category) => (
                      <div key={category.id} id={`categoria${category.id}`} style={{ marginBottom: '30px' }}> {/* ID para âncora */}
                        <h2 style={{ marginBottom: '15px', color: configStore.cor_primaria }}>{category.name}</h2>
                        <div className='sessao'>
                          <p>{category.description}</p>
                        </div>
                        <div className='produtos'>
                          {products[category.id] && products[category.id].length > 0 ? (
                            products[category.id]
                              .filter(product => product.estoque > 0)
                              .sort((a, b) => a.product_order - b.product_order)
                              .map((product, idx) => (
                                <div className='item' key={idx} onClick={() => handleOpenProductModal(product)}>
                                  <div className='imagem'>
                                    {productImages[product.id] && productImages[product.id].length > 0 ? (
                                      <img loading="lazy" src={productImages[product.id][0].url} alt={product.titulo} className='img-square' />
                                    ) : (
                                      <div className="placeholder">Sem imagem</div>
                                    )}
                                  </div>
                                  <div className='texto'>
                                    <h3 className='item-titulo'>{product.titulo}</h3>
                                    <p className='item-descricao'>{product.description}</p>
                                    <h4 className='item-preco'>
                                      {product.promocional_price > 0 ? (
                                        <>
                                          <span style={{ textDecoration: 'line-through', color: 'red', fontSize: '10px' }}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                          </span>
                                          <br />
                                          <span style={{ color: configStore.cor_preco_promocional }}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.promocional_price)}
                                          </span>
                                          &nbsp;
                                          <span style={{ color: 'green' }}>
                                            ({Math.round(((product.price - product.promocional_price) / product.price) * 100)}% de desconto)
                                          </span>
                                        </>
                                      ) : (
                                        <span style={{ color: configStore.cor_preco }}>
                                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                        </span>
                                      )}
                                    </h4>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-center my-5">
                              <h4>Nenhum produto encontrado nesta categoria</h4>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  ))

                )}
                <button className="whatsapp-button" onClick={handleClickWhatsappNoOrder}>
                  <FaWhatsapp className="whatsapp-icon" />
                </button>
              </div>
            </section>
            {cartItemCount > 0 && (
              <footer style={{ backgroundColor: configStore.cor_primaria }}>
                {storeDetails.status === "Aberta" ? (
                  <div>
                    <>
                      Total: {formattedTotal} &nbsp; &nbsp;
                    </>
                    <Button onClick={() => handleOpenCartModal()} style={{ backgroundColor: configStore.cor_botao_secundaria, borderColor: configStore.cor_botao_secundaria, color: configStore.cor_secundaria }}>
                      ({cartItemCount}) Ver carrinho
                    </Button>
                  </div>
                ) : (
                  <p>Loja indisponível para receber pedidos</p>
                )}
              </footer>
            )}
          </main>
          <StoreModal
            show={showModal}
            handleClose={handleCloseModal}
            storeDetails={storeDetails}
            storeConfig={configStore}
            storeConfigs={configStore}
            storeImages={imageStoreUrls}
          />
          {
            selectedProduct && (
              <ProductModal
                show={showProductModal}
                handleClose={handleCloseProductModal}
                addToCart={addToCart}
                product={selectedProduct}
                images={productImages[selectedProduct.id] || []}
                storeStatus={storeDetails.status}
                storeConfigs={configStore}
              />
            )
          }
          <CartModal
            show={showCartModal}
            handleClose={handleCloseCartModal}
            cart={cart}
            productImages={productImages} // Passando as imagens para o CartModal
            sendOrderToWhatsApp={sendOrderToWhatsApp}
            setCart={setCart}
            store={storeDetails}
            storeConfigs={configStore}
            cartItemCount={cartItemCount}
            setCartItemCount={setCartItemCount}
          />
        </>
      )}
    </div>
  );
}

export default Catalogo;
