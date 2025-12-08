'use server';

/**
 * @fileOverview An AI-powered tool that analyzes current orders,
 * prep times, and ingredients to suggest the optimal order preparation sequence, minimizing customer wait times.
 *
 * - prioritizeOrders - A function that handles the order prioritization process.
 * - Order - The type for a single order.
 * - PrioritizedOrdersOutput - The return type for the prioritizeOrders function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrderSchema = z.object({
  orderId: z.string().describe('The unique identifier for the order.'),
  items: z.array(z.string()).describe('The items in the order.'),
  prepTime: z.number().describe('The estimated preparation time for the order in minutes.'),
  ingredients: z.array(z.string()).describe('The ingredients required for the order.'),
  customerName: z.string().describe('The name of the customer who placed the order.'),
  orderTime: z.string().describe('The time the order was placed.'),
});

export type Order = z.infer<typeof OrderSchema>;

const PrioritizedOrdersOutputSchema = z.object({
  prioritizedOrderIds: z.array(z.string()).describe('The order IDs in the optimal preparation sequence.'),
  reasoning: z.string().describe('The AI reasoning for the suggested order sequence, in Russian.'),
});

export type PrioritizedOrdersOutput = z.infer<typeof PrioritizedOrdersOutputSchema>;

export async function prioritizeOrders(orders: Order[]): Promise<PrioritizedOrdersOutput> {
  return prioritizeOrdersFlow(orders);
}

const prompt = ai.definePrompt({
  name: 'prioritizeOrdersPrompt',
  input: {schema: z.array(OrderSchema)},
  output: {schema: PrioritizedOrdersOutputSchema},
  prompt: `You are an expert barista assistant designed to optimize order preparation in a busy bar setting. Your responses must be in Russian.

  Given the following list of orders with the 'готовится' status, analyze their prep times, and order placement times to suggest the optimal sequence for preparation.
  The goal is to minimize overall customer wait times.

  Orders:
  {{#each this}}
  Order ID: {{orderId}}
  Items: {{items}}
  Prep Time: {{prepTime}} minutes
  Customer Name: {{customerName}}
  Order Time: {{orderTime}}
  ---
  {{/each}}

  Consider factors such as:
  - Orders with shorter prep times should generally be prioritized to quickly reduce the queue.
  - The order in which customers placed their orders. First come, first served.

  Based on your analysis, provide the optimal order preparation sequence (as an array of orderIds) and a brief explanation of your reasoning in Russian.
  Your reasoning should be a single, concise sentence.
  Output only the JSON, do not include any prose before or after.`,
});

const prioritizeOrdersFlow = ai.defineFlow(
  {
    name: 'prioritizeOrdersFlow',
    inputSchema: z.array(OrderSchema),
    outputSchema: PrioritizedOrdersOutputSchema,
  },
  async orders => {
    const {output} = await prompt(orders);
    return output!;
  }
);
