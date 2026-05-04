import express from 'express'

const app = express()
const port = 8080;

app.get('/api/v1/', (req,res)=>{
  res.send("Pagina de inicio \nIntenta con post.")
});

app.post('/api/v1', (req,res)=> {
  //Metodo del servicio
  //messageHandler(req.body)
})

app.listen(port, ()=>{
  console.log('Server corriendo 🔥');
});