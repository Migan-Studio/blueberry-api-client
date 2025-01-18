import { Maintenance } from '../../types'
import { container } from '@sapphire/framework'
import { Request, Response } from 'express'

export function maintenance(req: Request, res: Response) {
  const data = req.body as Maintenance
  if (data.maintenance === undefined) {
    res.status(400).json({
      error: 'The maintenance value is required.',
      status_code: 400,
    })
    return
  }

  if (!data.maintenance) container.maintenance = null
  else container.maintenance = data

  res.status(200).send()
}
