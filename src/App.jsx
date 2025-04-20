import { useState, useEffect } from 'react'
import './App.css'
import "bootstrap-icons/font/bootstrap-icons.css"

// Acá está el swagger de la aplicación: 
// https://apiproducts-r8d0.onrender.com/swagger-ui/index.html#/
const API_URL = 'https://apiproducts-r8d0.onrender.com'

function App() {
  const [articles, setArticles] = useState([])
  const [name, setName] = useState("")
  const [amount, setAmount] = useState('')
  const [articleToDelete, setArticleToDelete] = useState(null)
  const [showModal, setShowModal] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentArticle, setCurrentArticle] = useState({
    id: null,
    name: '',
    amount: ''
  })

  const fetchArticles = async () => {
    try {
      const response = await fetch(API_URL+ '/api/products/all');
      const data = await response.json();
      console.log('data: ', data);
      setArticles(data)
    } catch (error) {
      console.log('algo salio mal..')
    }
  }

  //obtener los articulos al cargar la aplicacion
  useEffect(() => {
    fetchArticles();
  }, [])
  
  const handleAddArticle = async (e) => {
    e.preventDefault() //evita que el formulario refresque la pagina

    //validaciones antes de enviar
    if (!name.trim() || !amount.trim()) {
      alert('Todos los campos son obligatorios!')
      return
    }
    let parseAmount = parseFloat(amount)
    if (isNaN(parseAmount) || parseAmount <= 0) {
      alert('El monto debe ser un numero valido y mayor a 0!')
      return
    }
    let data = {name, amount: parseAmount}
    console.log(data)
    try {
      let response = await fetch(API_URL+ '/api/products/save-prod',{
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
      })

      let result = await response.json()
      console.log('registro agregado: ',result)
      
      //limpiar formulario
      setName('')
      setAmount('')
      fetchArticles()
      alert('registro agregado correctamente!')
    } catch (error) {
      console.error('Error en handleAddArticle: ', error)
      alert('Error al agregar un articulo!')
    }
  }

  const handleDeleteArticle = (article) => {
    setArticleToDelete(article)
    setShowModal(true)
  }

  const handleConfirmDelete = async () => {
    if (articleToDelete) {
      try {
        let response = await fetch(API_URL+ '/api/products/'+ articleToDelete.id, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchArticles()
          alert('Articulo eliminado!')
        }else{
          alert('Error al eliminar el articulo!')
        }
      } catch (error) {
        console.error('Error en handleConfirmDelete: ', error)
        alert('Error al eliminar el articulo!')
      }
    }
    setShowModal(false)
    setArticleToDelete(null)
  }

  const handleCancelDelete = () => {
    setShowModal(false)
    setArticleToDelete(null)
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setCurrentArticle({
      id: null,
      name: '',
      amount: ''
    })
  }

  const handleEditClick = (article) => {
    setCurrentArticle({
      id: article.id,
      name: article.name,
      amount: article.amount.toString()
    })
    setShowEditModal(true)
  }

  const handleEditInputChange = (e) => {
    console.log(e.target.name, e.target.value)
    const {name, value} = e.target
    setCurrentArticle(prev => ({...prev, [name]: value}))
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    console.log('edit article')
    if (!currentArticle.name.trim() || !currentArticle.amount.trim()) {
      return alert('Todos los cambos son obligatorios.')
    }

    const parseAmount = parseFloat(currentArticle.amount)
    if (isNaN(parseAmount)) {
      return alert('El monto debe ser un número válido.')
    }

    try {
      let response = await fetch(`${API_URL}/api/products/${currentArticle.id}`,{
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentArticle.name,
          amount: parseAmount
        })
      })
      console.log('update response: ', response, response.ok)
      if (response.ok) {
        fetchArticles()
        setShowEditModal(false)
        alert('Artículo actualizado correctamente.')
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar el artículo');
    }
  }

  return (
    <>
      <h1>ABM Articulos</h1>
      
      <h2>Agregar articulo</h2>
      <form action="" onSubmit={handleAddArticle}>
        <div>
          <label>Nombre: </label>
          <input type="text" value={name} onChange={(e)=> setName(e.target.value)} required/>
        </div>
        
        <div>
          <label>Monto: </label>
          <input type="number" value={amount} onChange={(e)=> setAmount(e.target.value)} required/>
        </div>
        <button type='submit'>Agregar</button>
      </form>


      <table className='table'>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.length > 0 ?(articles.map((art)=>(
            <tr key={art.id}>
              <td>{art.id}</td>
              <td>{art.name}</td>
              <td>{art.amount}</td>
              <td>
                <button onClick={() => handleEditClick(art)}>
                  <i className='bi bi-pencil'></i>
                </button>
                <button onClick={()=> handleDeleteArticle(art)}>
                  <i className='bi bi-trash'></i>
                </button>
              </td>
            </tr>
          )))
          :
          (
            <tr>
              <td colSpan={3}>No hay articulos disponibles!</td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar el artículo "{articleToDelete?.name}"?</p>
            <button onClick={handleConfirmDelete}>Eliminar</button>
            <button onClick={handleCancelDelete}>Cancelar</button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className='modal'>
          <div className='modal-content'>
            <h2>Modificar Articulo</h2>
            <form action="" onSubmit={handleSubmitEdit}>
              <div>
                <label htmlFor="">Nombre: </label>
                <input type="text" name='name' value={currentArticle.name} onChange={handleEditInputChange} required/>
              </div>
              <div>
                <label htmlFor="">Monto: </label>
                <input type="text" name='amount' value={currentArticle.amount} onChange={handleEditInputChange} required/>
              </div>
              <div>
                <button onClick={handleCancelEdit}><i className='bi bi-x'></i>Cancelar</button>
                <button><i className='bi bi-check'></i>Modificar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default App
