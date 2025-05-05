import { Graph } from '../models/graph.model.js';
import { graphValidator } from '../validations/graph.validation.js';
import { catchError } from '../utils/error-response.js';

export class GraphController {
    async createGraph(req, res) {
        try {
            const { error, value } = graphValidator(req.body);

            if (error) {
                return catchError(res, 400, error);
            }

            const graph = await Graph.create(value);

            return res.status(201).json({
                statusCode: 201,
                message: 'success',
                data: graph
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    async getAllGraphs(_, res) {
        try {
            const graphs = await Graph.find().populate('doctorId');

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: graphs
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    async getGraphById(req, res) {
        try {
            const graph = await GraphController.findGraphById(res, req.params.id);

            return res.status(200).json({
                statusCode: 200,
                message: 'succes',
                data: graph
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    async updateGraphById(req, res) {
        try {
            const id = req.params.id;

            await GraphController.findGraphById(res, id);

            const updatedgraph = await Graph.findByIdAndUpdate(id, req.body, { new: true });

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: updatedgraph
            });
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }

    async deleteGraphById(req, res) {
        try {
            const id = req.params.id;

            await GraphController.findGraphById(res, id);
            await Graph.findByIdAndDelete(id);

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: {}
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    static async findGraphById(res, id) {
        try {
            const graph = await Graph.findById(id).populate('doctorId');

            if (!graph) {
                return catchError(res, 404, 'Graph not found');
            }

            return graph;
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }
}