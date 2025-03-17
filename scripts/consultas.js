//Buscar todos los restaurantes de un tipo de comida específico (ej. "Chinese").
db.restaurants.find({ type_of_food: "Chinese" });

//Listar las inspecciones con violaciones, ordenadas por fecha.
db.inspections.find(
  { result: "Violation Issued" }
).sort({ date: -1 });

//Encontrar restaurantes con una calificación superior a 4.
db.restaurants.find(
  { rating: { $gt: 4 } }  
).sort(
  { rating: -1 }  
);

// Agrupar restaurantes por tipo de comida y calcular la calificación promedio.
db.restaurants.aggregate([
    {
        $group: {
            _id: "$type_of_food",  
            avg_rating: { $avg: "$rating" }  
        }
    },
    {
        $sort: { avg_rating: -1 }  
]);

// Contar el número de inspecciones por resultado y mostrar los porcentajes.
db.inspections.aggregate([
    {
        $group: {
            _id: "$result",  
            count: { $sum: 1 } 
        }
    },
    {
        $group: {
            _id: null,
            total: { $sum: "$count" },
            results: { $push: { result: "$_id", count: "$count" } }
        }
    },
    {
        $unwind: "$results"
    },
    {
        $project: {
            _id: 0,
            result: "$results.result",
            count: "$results.count",
            percentage: { $multiply: [{ $divide: ["$results.count", "$total"] }, 100] } 
        }
    },
    {
        $sort: { count: -1 }  
    }
]);

//Unir restaurantes con sus inspecciones utilizando $lookup.
db.restaurants.aggregate([
    {
        $lookup: {
            from: "inspections",
            localField: "_id",
            foreignField: "restaurant_id",
            as: "inspection_history"
        }
    }
]);
