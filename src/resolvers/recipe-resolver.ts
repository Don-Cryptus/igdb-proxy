import { Resolver, Query, Arg } from 'type-graphql';
import { Recipe } from '../entity/recipe-type';
import { createRecipeSamples } from '../utils/recipe-samples';
import { CacheControl } from '../utils/cache-control';
import { getTime } from '../utils/utils';
import { twitchAccessToken, igdb, fields, where } from 'ts-igdb-client';

@Resolver(() => Recipe)
export class RecipeResolver {
  private readonly items: Recipe[] = createRecipeSamples();

  @Query(() => [Recipe], { nullable: true })
  async recipe(@Arg('title') title: string): Promise<Recipe[] | undefined> {
    console.log(`Called 'recipe' with title '${title}' on ${getTime()}`);
    return await this.items.filter((recipe) => recipe.title.includes(title));
  }

  @Query(() => [Recipe], { nullable: true })
  // here we declare that we want to cache the query for 60s
  @CacheControl({ maxAge: 60 })
  async cachedRecipe(
    @Arg('title') title: string
  ): Promise<Recipe[] | undefined> {
    console.log(`Called 'cachedRecipe' with title '${title}' on ${getTime()}`);
    return await this.items.filter((recipe) => recipe.title.includes(title));
  }

  @Query(() => [Recipe])
  async recipes(): Promise<Recipe[]> {
    return await this.items;
  }

  @Query(() => [Recipe])
  async games(): Promise<Recipe[]> {
    const twitchSecrets = {
      client_id: process.env.CLIENT_ID!,
      client_secret: process.env.CLIENT_SECRET!,
    };

    const accessToken = await twitchAccessToken(twitchSecrets);
    const client = igdb(twitchSecrets.client_id, accessToken);
    const { data } = await client
      .request('games')
      .pipe(fields(['name', '']), where('created_at', '<', Date.now()))
      .execute();
    console.log(data);
    return [];
  }
}
