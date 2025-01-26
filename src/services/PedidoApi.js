const PedidoApi = () => {
 
  const api_url = process.env.REACT_APP_API_URL;
  const apiToken = process.env.REACT_APP_API_TOKEN;

  

  const createPedido = async (pedido,userId) =>{
    const pedidoComUserId = {
      ...pedido,
      user_id: userId, // Pega o user_id do objeto `user`
      
    };
    
    const response = await fetch(`${api_url}/intellicatalog/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(pedidoComUserId),
    });

    if (response.status === 401) {
      // Redireciona para a tela de login 
    } 
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao criar pedido");
    }
    console.log("response: ",response.json());
    return await response.json();
  }

  const addItemPedido = async (item,pedido) =>{
     
    const response = await fetch(`${api_url}/intellicatalog/v1/orders/${pedido}/items`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        items: item, // Certifique-se de que `item` esteja no formato correto
      }),
    });

    if (response.status === 401) {
      // Redireciona para a tela de login
    
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao enviar dados:', errorData);
      throw new Error(errorData.message || "Erro ao criar pedido");
    }

    return await response.json();
  }


  return {
    createPedido,
    addItemPedido
  };
}

export default PedidoApi;

