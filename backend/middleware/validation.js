import Joi from 'joi';

const analyzeSchema = Joi.object({
  companyName: Joi.string().trim().min(2).max(100).required(),
  website: Joi.string().uri().optional(),
  details: Joi.object().optional(),
  extractedText: Joi.string().optional(),
  uploadedFiles: Joi.array().items(Joi.object({
    filename: Joi.string().required(),
    originalName: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().required(),
    mimetype: Joi.string().required()
  })).optional()
});

const companyQuerySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
});

const ocrSchema = Joi.object({
  filePath: Joi.string().required()
});

export const validateAnalyzeRequest = (req, res, next) => {
  const { error } = analyzeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

export const validateCompanyQuery = (req, res, next) => {
  const { error } = companyQuerySchema.validate({ name: req.params.name });
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

export const validateOcrRequest = (req, res, next) => {
  const { error } = ocrSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

export const handleValidationErrors = (error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  next(error);
};
