import { Request, Response } from "express";
import { AppDataSource } from "../data-source"
import { Keywords } from "../entity/Keywords"

interface Filters {
    suchvolumen: { from: number | null, to: number | null };
    position: { from: number | null, to: number | null };
    impressions: { from: number | null, to: number | null }
    keywordTyp: string
}

export async function fetchAll(req: Request, res: Response) {
    console.log(req.body);
    let length = 0;
    let keywords: any;
    const skip = Number(req.query.skip);
    const take = req.query.take === undefined ? undefined : Number(req.query.take);
    const hasFilters = req.body.hasFilter;
    const filters = req.body.filters;

    if (hasFilters) {
        console.log('entered hasFilter')
        if (take === undefined) {
            console.log('entered if in hasFilters')
            keywords = await getFilteredKeywords(filters, undefined, undefined);
            return res.status(200).send({
                data: keywords.slice(0, 10),
                length: keywords.length
            });
        }
        keywords = await getFilteredKeywords(filters, skip, take);
        return res.status(200).send(keywords);
    }

    if (take === undefined) {
        console.log('entered if take after hasFilter')
        keywords = await Keywords.find({
            order: {
                createdAt: "DESC"
            }
        });
        return res.status(200).send({
            data: keywords.slice(0, 10),
            length: keywords.length
        });
    }

    keywords = await Keywords.find({
        skip: skip,
        take: take,
        order: {
            createdAt: "DESC"
        }
    });
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
    res.status(200).json('Successfully added keywords')
}

async function getFilteredKeywords(filters: Filters, skip: number | undefined, take: number | undefined) {
    let hasAnyFilter = false;
    
    let query = AppDataSource
        .getRepository(Keywords)
        .createQueryBuilder("keywords");
   
    skip ? query.skip(skip) : null
    take ? query.take(take) : null

    if (filters.suchvolumen.from) {
        console.log('entere filters.suchvolumen.from 1');
        hasAnyFilter = true;
        if (filters.suchvolumen.to) {
            console.log('entered if filters.suchvolumen.to 2');
            query.where(`keywords.suchvolumen >= ${filters.suchvolumen.from} AND keywords.suchvolumen <= ${filters.suchvolumen.to}`);
        } else {
            console.log('entered else after filters.suchvolumen.to 3')
            query.where(`keywords.suchvolumen >= ${filters.suchvolumen.from}`);
        }
    } else if (filters.suchvolumen.to) {
        console.log('entered else if after filters.suchvolumen.from 4')
        hasAnyFilter = true;
        query.where(`keywords.suchvolumen <= ${filters.suchvolumen.to}`);
    }

    if (filters.impressions.from) { 
        console.log('entere filters.impressions.from 5');
        if (hasAnyFilter) {
            console.log('entere hasAnyFilter in impressions 6');

            if (filters.impressions.to) {
                console.log('entered if filters.impressions.to 7');
                query.andWhere(`keywords.impressions >= ${filters.impressions.from} AND keywords.impressions <= ${filters.impressions.to}`);
            } else {
                console.log('entered else after filters.impressions.to 8');
                query.andWhere(`keywords.impressions >= ${filters.impressions.from}`);
            }
        } else {
            console.log('entere else after hasAnyFilter in impressions 9');
            hasAnyFilter = true;
            if (filters.impressions.to) {
                console.log('entere if filters.impressions.to 10');
                query.where(`keywords.impressions >= ${filters.impressions.from} AND keywords.impressions <= ${filters.impressions.to}`);
            } else {
                console.log('entere else after filters.impressions.to 11');
                query.where(`keywords.impressions >= ${filters.impressions.from}`);
            }
        }
    } else if (filters.impressions.to) {
        console.log('entered else if filters.impressions.to 12');

        hasAnyFilter = true;
        query.where(`keywords.impressions <= ${filters.impressions.to}`);
    }
    if (filters.position.from) {
        console.log('entered if filters.position.from 13');
        if (hasAnyFilter) {
            console.log('entered hasAnyFilter in filters.position.from 14');

            if (filters.position.to) {
                console.log('entered if filters.position.to in hasAnyFilter 15');

                query.andWhere(`keywords.position >= ${filters.position.from} AND keywords.position <= ${filters.position.to}`)
            } else {
                console.log('16');
                console.log('entered else filters.position.to in hasAnyFilter 16');
                query.andWhere(`keywords.position >= ${filters.position.from}`)
            }
        } else {
            console.log('entered else after hasAnyFilter 17');
            hasAnyFilter = true;
            if (filters.position.to) {
                console.log('entered if filters.position.to in else 18');

                query.where(`keywords.position >= ${filters.position.from} AND keywords.position <= ${filters.position.to}`);
            } else {
                console.log('entered else after filters.position.to 19');
                query.where(`keywords.position >= ${filters.position.from}`);
            }
        }
    } else if (filters.position.to) {
        console.log('entered  else if filters.position.to 20');

        hasAnyFilter = true;
        query.where(`keywords.position <= ${filters.position.to}`);
    }

    if (filters.keywordTyp !== '') {
        console.log('entered filster.keywordTyp 21');

        if(hasAnyFilter) {
            console.log('entered hasAnyFilter filster.keywordTyp 22');
            query.andWhere(`keywords.typ = ${filters.keywordTyp}`)
        } else {
            console.log('22');
            console.log('entered else filster.keywordTyp 22');
            query.where(`keywords.typ = ${filters.keywordTyp}`);
        }
    }

    const keywords = await query.getMany();
    return keywords;

}

module.exports = {
    fetchAll,
    save
}