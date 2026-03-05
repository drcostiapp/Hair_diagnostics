import 'dotenv/config'
import { app } from './app.js'

const PORT = parseInt(process.env.PORT || '3001', 10)

app.listen(PORT, () => {
  console.log(`[server] Dr. Costi API running on port ${PORT}`)
  console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`)
})
