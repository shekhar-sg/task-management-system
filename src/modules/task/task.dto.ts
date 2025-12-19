import {Priority, Status} from "@prisma/client";
import {z} from "zod";

export const CreateTaskDto = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  description: z.string().optional(),
  dueDate: z.iso.datetime("Invalid date format"),
  priority: z.enum(Priority),
  status: z.enum(Status).default(Status.TODO),
  assignedToId: z.string().optional(),
});

export const UpdateTaskDto = z.object({
  title: z.string().max(100).optional(),
  description: z.string().optional(),
  dueDate: z.iso.datetime("Invalid date format").optional(),
  priority: z.enum(Priority).optional(),
  status: z.enum(Status).optional(),
  assignedToId: z.string().nullable().optional(),
});

const arrayify = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess(
        (val:string) => val?.split(","),
        z.array(schema).optional()
    );

export const TaskQueryDto = z.object({
  view: arrayify(z.enum(["CREATED", "ASSIGNED", "ALL"])),
  status: arrayify(z.enum(Status)),
  priority: arrayify(z.enum(Priority)),
  sortByDueDate: z.enum(["asc", "desc"]).optional(),
  overdue: z.string().transform((val) => val === "true").pipe(z.boolean()).optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskDto>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskDto>;
export type TaskQueryInput = z.infer<typeof TaskQueryDto>;
