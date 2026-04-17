import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import express from 'express'
import { departments, subjects } from '../db/schema';
import { db } from '../db';

const router = express.Router()

router.get('/', async (req,res) => {
    try{
        const { search, department, page = 1, limit = 10} = req.query;

        const filterConditions = [];

        const currentPage = Math.max(1, +page);
        const limitPerPage = Math.max(1, +limit);

        const offset = ( currentPage - 1) * limitPerPage;

        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            );
        }

        if (department) {
            filterConditions.push(
                ilike(departments.name, `%${department}%`)
            );
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(subjects)
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(whereClause);

        const total = countResult[0]?.count || 0;


        const subjectsList = await db.select({ 
            ...getTableColumns(subjects),
            department: { ...getTableColumns(departments) }
        })
        .from(subjects)
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(whereClause)
        .orderBy(desc(subjects.createdAt))
        .offset(offset)
        .limit(limitPerPage);


        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total,
                totalPages: Math.ceil(total / limitPerPage)
            }
        });

    }catch (e) {
        console.error(`GET /subjects error: ${e}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


export default router;