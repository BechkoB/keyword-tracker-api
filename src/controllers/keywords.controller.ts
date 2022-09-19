import { Request, Response } from "express";
import { AppDataSource } from "../data-source"
import { Keywords } from "../entity/Keywords"

interface Filters {
    suchvolumen: { from: number | null, to: number | null };
    position: { from: number | null, to: number | null };
    impressions: { from: number | null, to: number | null }
    keywordTyp: string, 
    keyword: string
}

export async function fetchAll(req: Request, res: Response) {
    let keywords: any;
    let order: any;
    let direction: any;
    req.query.order !== undefined ? order = req.query.order.toString() : undefined;
    req.query.direction !== undefined ? direction = req.query.direction.toString() : undefined;

    console.log(req.query.order, req.query.direction, 'req.query');
    const skip = Number(req.query.skip);
    const take = req.query.take === undefined ? undefined : Number(req.query.take);
    const hasFilters = req.body.hasFilter;
    const filters = req.body.filters;

    if (hasFilters) {
        if (take === undefined) {
            keywords = await getFilteredKeywords(filters, undefined, undefined, order, direction);
            return res.status(200).send({
                data: keywords.slice(0, 10),
                length: keywords.length
            });
        }
        keywords = await getFilteredKeywords(filters, skip, take, order, direction);
        return res.status(200).send(keywords);
    }

    if (take === undefined) {

        let query = AppDataSource
            .getRepository(Keywords)
            .createQueryBuilder("keywords")

        if(order && direction) {
            query.orderBy(order, direction.toUpperCase());
        } else {
            query.orderBy("created_at", "ASC")
        }

        keywords = await query.getMany();
        return res.status(200).send({
            data: keywords.slice(0, 10),
            length: keywords.length
        });
    }
    let query = AppDataSource
        .getRepository(Keywords)
        .createQueryBuilder("keywords")
        if (order && direction) {
            query.orderBy(order, direction.toUpperCase());
        } else {
            query.orderBy("created_at", "ASC")
        }
        query.skip(skip)
        query.take(take)
        keywords = await query.getMany()
    return res.status(200).send(keywords);
}

export async function save(req: Request, res: Response) {
    const { keyword, url, suchvolumen, typ } = req.body;

    const key = new Keywords();
    key.keyword = keyword;
    key.url = url;
    key.suchvolumen = suchvolumen;

    key.typ = typ;
    const keywordRepo = AppDataSource.getRepository(Keywords);
    await keywordRepo.save(key);
    res.status(200).json('Successfully added keywords');
}

async function getFilteredKeywords(filters: Filters, skip: number | undefined, take: number | undefined, order: string, direction: string) {
    let hasAnyFilter = false;
    
    let query = AppDataSource
        .getRepository(Keywords)
        .createQueryBuilder("keywords");
   
    skip ? query.skip(skip) : null
    take ? query.take(take) : null
    order && take ? query.orderBy(`"${order}", "${direction}"`) : null

    if (filters.suchvolumen.from) {
        hasAnyFilter = true;
        if (filters.suchvolumen.to) {
            query.where(`keywords.suchvolumen >= ${filters.suchvolumen.from} AND keywords.suchvolumen <= ${filters.suchvolumen.to}`);
        } else {
            query.where(`keywords.suchvolumen >= ${filters.suchvolumen.from}`);
        }
    } else if (filters.suchvolumen.to) {
        hasAnyFilter = true;
        query.where(`keywords.suchvolumen <= ${filters.suchvolumen.to}`);
    }

    if (filters.impressions.from) { 
        if (hasAnyFilter) {

            if (filters.impressions.to) {
                query.andWhere(`keywords.impressions >= ${filters.impressions.from} AND keywords.impressions <= ${filters.impressions.to}`);
            } else {
                query.andWhere(`keywords.impressions >= ${filters.impressions.from}`);
            }
        } else {
            hasAnyFilter = true;
            if (filters.impressions.to) {
                query.where(`keywords.impressions >= ${filters.impressions.from} AND keywords.impressions <= ${filters.impressions.to}`);
            } else {
                query.where(`keywords.impressions >= ${filters.impressions.from}`);
            }
        }
    } else if (filters.impressions.to) {

        hasAnyFilter = true;
        query.where(`keywords.impressions <= ${filters.impressions.to}`);
    }
    if (filters.position.from) {
        if (hasAnyFilter) {

            if (filters.position.to) {

                query.andWhere(`keywords.position >= ${filters.position.from} AND keywords.position <= ${filters.position.to}`);
            } else {
                console.log('16');
                query.andWhere(`keywords.position >= ${filters.position.from}`);
            }
        } else {
            hasAnyFilter = true;
            if (filters.position.to) {

                query.where(`keywords.position >= ${filters.position.from} AND keywords.position <= ${filters.position.to}`);
            } else {
                query.where(`keywords.position >= ${filters.position.from}`);
            }
        }
    } else if (filters.position.to) {

        hasAnyFilter = true;
        query.where(`keywords.position <= ${filters.position.to}`);
    }

    if (filters.keywordTyp !== '') {

        if(hasAnyFilter) {
            query.andWhere(`keywords.typ = ${filters.keywordTyp}`);
        } else {
            console.log('22');
            query.where(`keywords.typ = ${filters.keywordTyp}`);
        }
    }

    if(filters.keyword !== '' && filters.keyword !== undefined) {
        if (hasAnyFilter) {
            query.andWhere(`keywords.keyword LIKE '%${filters.keyword}%'`);
        } else {
            query.where(`keywords.keyword LIKE '%${filters.keyword}%'`);
        }
    }

    const keywords = await query.getMany();
    return keywords;

}

module.exports = {
    fetchAll,
    save
}