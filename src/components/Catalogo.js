import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Catalogo.css';
import axios from 'axios';
import StoreModal from './StoreModal';
import ProductModal from './ProductModal';
import CartModal from './CartModal';
import { useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';

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

 


  //busca token no env
  const apiToken = process.env.REACT_APP_API_TOKEN;
  const api_url = process.env.REACT_APP_API_URL;

  const handleOpenCartModal = () => {
    setShowCartModal(true);
  };

  const handleCloseCartModal = () => setShowCartModal(false);



  const addToCart = (product) => {
    setCart(prevCart => {
      const exists = prevCart.find(item => item.id === product.id);
      if (exists) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };


  const sendOrderToWhatsApp = async () => {
    const orderDetails = cart.map(item => ({
      title: item.titulo,
      price: item.price,
      quantity: item.quantity, // Inclui a quantidade no pedido
      description: item.description,
    }));

    const message = encodeURIComponent(`Detalhes do pedido:\n${JSON.stringify(orderDetails, null, 2)}`);

    const whatsappApiUrl = `https://api.whatsapp.com/send?text=${message}`; // URL da API do WhatsApp

    window.open(whatsappApiUrl, '_blank');
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
    console.log(store.id)
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
        console.log("fotos por usuario: ", fotos)
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

  const loadProductImages = async (products) => {
    const newImages = {};

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
    if (storeDetails) {
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

  return (
    <div className="App">
      <header className="bg-color-config text-white text-center bg-color-config" onClick={handleOpenModal} >
        {imageStoreUrls.map((image) => (
          <div key={image.id}> {/* Use o id como chave */}
            <img src={image.url} alt={`Foto da store ${storeDetails.namestore}`} style={{
              width: "100px", 
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover"
            }} />
          </div>
        ))}
        <br/>
        <h1 style={{ cursor: 'pointer' , fontFamily: "Kanit" }}>{storeDetails.namestore}</h1>
        {/*} <p>{storeDetails.status}</p>{*/}
        {/*}  <p className='textomenor'>Horário: <br />{storeDetails.opening_hours} - {storeDetails.closing_hours}</p>{*/}
      </header>

      <main className="my main-content">
        <section>
          <div className="persisti">
            <div className='nav-tabs-responsive'>
              <ul className='nav nav-tabs flex-nowrap w-100' role='tablist'>
                {categories.map((category, index) => (
                  <li className='nav-item flex-fill text-center' key={index}>
                    <a
                      className={`nav-link ${activeTab === `categoria${category.id}` ? 'active' : ''}`}
                      id={`tab${category.id}-tab`}
                      href={`#content${category.id}`}
                      role='tab'
                      aria-controls={`tab${category.id}`}
                      aria-selected={activeTab === `categoria${category.id}`}
                      onClick={(e) => { e.preventDefault(); setActiveTab(`categoria${category.id}`); }}
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
                <div
                  className={`tab-pane fade ${activeTab === `categoria${category.id}` ? 'show active' : ''}`}
                  id={`content${category.id}`}
                  role='tabpanel'
                  aria-labelledby={`tab${category.id}-tab`}
                  key={index}
                >
                  <div className='sessao'>
                    <p>{category.description}</p>
                  </div>
                  {products[category.id] && products[category.id].length > 0 ? (
                    products[category.id].map((product, idx) => (
                      <div className='item' key={idx} onClick={() => handleOpenProductModal(product)}>
                        <div className='imagem'>
                          {productImages[product.id] && productImages[product.id].length > 0 ? (
                            <img
                              loading="lazy"
                              src={productImages[product.id][0].url} // Mostra apenas a primeira imagem
                              alt={product.titulo}
                              className='img-square' 
                            />
                          ) : (
                            <div className="placeholder">
                              Sem imagem
                            </div>
                          )}
                        </div>
                        <div className='texto'>
                          <h3>{product.titulo}</h3>
                          <p>{product.description}</p>
                          <h4>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}</h4>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center my-5">
                      <h4>Nenhum produto encontrado nesta categoria</h4>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>


        </section>
        <footer>
          {storeDetails.status === "Aberta" ? (
            <>
              <Button  onClick={() => handleOpenCartModal()} style={{ backgroundColor: '#D8F793', borderColor: '#D8F793' , color: 'black' }}>
                Ver Carrinho
              </Button>
              &nbsp;
              <Button onClick={() => handleOpenCartModal()} style={{ backgroundColor: '#E0BE36', borderColor: '#E0BE36' , color: 'black' }}>
                Finalizar Pedido</Button>
            </>
          ) : (

            <p>Loja indisponível para receber pedidos</p>
          )}
        </footer>
      </main>
      <StoreModal show={showModal} handleClose={handleCloseModal} storeDetails={storeDetails} />

      {selectedProduct && (
        <ProductModal
          show={showProductModal}
          handleClose={handleCloseProductModal}
          addToCart={addToCart}
          product={selectedProduct}
          images={productImages[selectedProduct.id] || []}
          storeStatus={storeDetails.status}
        />
      )}

      <CartModal
        show={showCartModal}
        handleClose={handleCloseCartModal}
        cart={cart}
        productImages={productImages} // Passando as imagens para o CartModal
        sendOrderToWhatsApp={sendOrderToWhatsApp}
        setCart={setCart}
        store={storeDetails}
      />
    </div >
  );
}

export default Catalogo;
