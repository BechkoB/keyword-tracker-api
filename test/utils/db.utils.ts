import { DataSource, IsNull, Not } from "typeorm";
import { Page } from "../../src/entity/Page";
import { PageData } from "../../src/entity/PageData";
import { Query } from "../../src/entity/Query";
import { QueryData } from "../../src/entity/QueryData";
import { User } from "../../src/entity/User";

export const cleanUpDb = async (dataSource: DataSource) => {
  // delete all users
  const usersRepo = dataSource.getRepository(User);
  await usersRepo.delete({ email: Not(IsNull()) });

  // delete all queries
  const queryRepo = dataSource.getRepository(Query);
  await queryRepo.delete({ name: Not(IsNull()) });

  // delete all pages
  const pagesRepo = dataSource.getRepository(Page);
  await pagesRepo.delete({ name: Not(IsNull()) });

  // delete all page_data
  const pairDataRepo = dataSource.getRepository(PageData);
  await pairDataRepo.delete({ id: Not(IsNull()) });

    // delete all query_data
    const queryDataRepo = dataSource.getRepository(QueryData);
    await queryDataRepo.delete({ id: Not(IsNull()) });
};
