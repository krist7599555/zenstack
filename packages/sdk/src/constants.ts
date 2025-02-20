/**
 * @zenstackhq/runtime package name
 */
export const RUNTIME_PACKAGE = '@zenstackhq/runtime';

export { AUXILIARY_FIELDS, GUARD_FIELD_NAME, TRANSACTION_FIELD_NAME, CrudFailureReason } from '@zenstackhq/runtime';

/**
 * Expression context
 */
export enum ExpressionContext {
    DefaultValue = 'DefaultValue',
    AccessPolicy = 'AccessPolicy',
    ValidationRule = 'ValidationRule',
}

export const STD_LIB_MODULE_NAME = 'stdlib.zmodel';
