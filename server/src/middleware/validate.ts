import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodRawShape, ZodError } from 'zod';

/**
 * Reusable Express middleware to validate requests against Zod schemas.
 * Validates body, query, and params. Returns formatted validation errors immediately.
 */
export const validate = (schema: ZodObject<ZodRawShape>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate the request payload against the schema
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Assign the parsed/sanitized data back to request properties in-place (handles Express 5 query/params getters)
      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      
      if (parsed.query !== undefined) {
        const queryObj = req.query as any;
        for (const key in queryObj) {
          delete queryObj[key];
        }
        Object.assign(queryObj, parsed.query);
      }

      if (parsed.params !== undefined) {
        const paramsObj = req.params as any;
        for (const key in paramsObj) {
          delete paramsObj[key];
        }
        Object.assign(paramsObj, parsed.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Map error paths by removing the root prefix (body/query/params)
        const errors = error.issues.map((issue) => ({
          field: issue.path.length > 1 ? issue.path.slice(1).join('.') : issue.path[0],
          message: issue.message,
        }));

        console.warn('⚠️ Validation failed for request:', req.originalUrl, JSON.stringify(errors, null, 2));

        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};
