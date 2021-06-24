import { BaseService } from '~/base/service.base'
import { getTypedValues } from '~/types/utility.type'
import { TOKEN } from '../config.instadapp'

export abstract class BaseInstadappService extends BaseService {
  // Convert token strings to objects
  static objectifyToken(_target: BaseInstadappService, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFunction: Function = descriptor.value
    descriptor.value = function () {
      const argObj = arguments[0] as Record<string, unknown>
      const newArgObj = Object.entries(argObj).reduce((obj, [key, val]) => {
        const tokenObj = getTypedValues(TOKEN).find(token => token.symbol === val)
        if (tokenObj) {
          return { ...obj, [key]: tokenObj }
        }
        return { ...obj, [key]: val }
      }, {} as Record<string, unknown>)
      return originalFunction.apply(this, [newArgObj])
    }
    return descriptor
  }
}
