const paginate = async ({
  model,
  filter = {},
  page = 1,
  limit = 10,
  sort = "-createdAt",
  populate = null,
  lean = true,
}) => {
  const numericLimit = Math.max(Number(limit) || 10, 1);
  const numericPage = Math.max(Number(page) || 1, 1);
  const skip = (numericPage - 1) * numericLimit;

  let query = model.find(filter).sort(sort).skip(skip).limit(numericLimit);

  if (populate) {
    query = query.populate(populate);
  }

  if (lean) {
    query = query.lean();
  }

  const [results, totalDocuments] = await Promise.all([
    query,
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalDocuments / numericLimit);

  return {
    results,
    pagination: {
      currentPage: numericPage,
      totalPages,
      limit: numericLimit,
      totalResults: totalDocuments,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1,
    },
  };
};

module.exports = paginate;
