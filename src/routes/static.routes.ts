import express from 'express'
import { serveSingleImageController } from '~/controllers/medias.controller'
import { wrapAsync } from '~/utils/handler'

const staticRouter = express.Router()

// Này là param
staticRouter.get('/image/:filename', wrapAsync(serveSingleImageController))

export default staticRouter
