import type { Repository } from '../repository';

const photo = (seed: string, width = 900, height = 700) => ({
  uri: `https://picsum.photos/seed/keepforever-${seed}/${width}/${height}`,
  width,
  height,
  mimeType: 'image/jpeg',
});

/** Demo content for the browser preview so every screen has something to show. */
export async function seed(repo: Repository) {
  const lake = await repo.createAlbum('Summers at the Lake', 'Every July since 1998');
  const kitchen = await repo.createAlbum("Nana's Kitchen", 'Recipes, flour-dusted hands, and Sunday lunches');
  const growing = await repo.createAlbum('Growing Up', 'Firsts, milestones, and school days');
  const travels = await repo.createAlbum('Road Trips & Adventures', 'Wrong turns that became the best stories');

  // Summers at the Lake
  await repo.createMemory(
    { title: 'First swim off the dock', story: 'Grandpa held the rope while everyone cheered from the shore.', occurredOn: '1998-07-14', location: 'Lake Wanaka', photos: [photo('dock')] },
    lake,
  );
  await repo.createMemory(
    { title: 'The big family picnic', story: 'Four generations, one very long table.', occurredOn: '2009-07-02', location: 'Lake Wanaka', photos: [photo('picnic1'), photo('picnic2'), photo('picnic3')] },
    lake,
  );
  await repo.createMemory(
    { title: 'Night of a thousand fireflies', story: 'The kids stayed up past midnight chasing lights across the lawn, jam jars in hand.', occurredOn: '2012-07-19', location: 'Lake Wanaka', photos: [photo('fireflies1'), photo('fireflies2')] },
    lake,
  );
  await repo.createMemory(
    { title: 'Dad finally catches a fish', story: 'Eleven summers of trying. It was tiny, and he still insisted on mounting it.', occurredOn: '2016-07-08', location: 'Lake Wanaka', photos: [photo('fishing', 700, 900)] },
    lake,
  );

  // Nana's Kitchen
  await repo.createMemory(
    { title: "Nana's lemon cake recipe", story: 'Two lemons, a lot of butter, and never measure the sugar.', occurredOn: '2015-07-20', location: null, photos: [] },
    kitchen,
  );
  await repo.createMemory(
    { title: 'Sunday roast, the whole crew', story: 'Nana carved, Grandpa told the same joke, and nobody left the table for three hours.', occurredOn: '2003-05-11', location: "Nana's house", photos: [photo('roast1'), photo('roast2')] },
    kitchen,
  );
  await repo.createMemory(
    { title: 'Learning to roll pastry', story: 'Cold hands, cold butter, and a lot of patience. Mine looked nothing like hers.', occurredOn: '2018-04-22', location: "Nana's kitchen", photos: [photo('pastry')] },
    kitchen,
  );
  await repo.createMemory(
    { title: 'Her handwritten recipe box', story: 'Index cards stained with vanilla and butter. We scanned every one before they faded.', occurredOn: '2021-09-03', location: null, photos: [photo('recipebox1'), photo('recipebox2'), photo('recipebox3')] },
    kitchen,
  );

  // Growing Up
  await repo.createMemory(
    { title: 'First day of school', story: 'Oversized backpack, brave smile, and one very emotional parent at the gate.', occurredOn: '2006-02-06', location: 'Roslyn Primary', photos: [photo('school1'), photo('school2')] },
    growing,
  );
  await repo.createMemory(
    { title: 'Learning to ride a bike', story: 'Training wheels off at last. Three wobbles, one scraped knee, and then she was gone down the street.', occurredOn: '2008-10-12', location: 'Our street', photos: [photo('bike', 700, 900)] },
    growing,
  );
  await repo.createMemory(
    { title: 'The school play', story: 'Third tree from the left. Never has a tree had so much stage presence.', occurredOn: '2011-11-25', location: 'Town hall', photos: [photo('play1'), photo('play2'), photo('play3')] },
    growing,
  );
  await repo.createMemory(
    { title: 'Graduation day', story: 'Cap in the air, proud tears all round. Four generations in the front row.', occurredOn: '2024-12-10', location: 'Dunedin', photos: [photo('grad1'), photo('grad2'), photo('grad3')] },
    growing,
  );

  // Road Trips & Adventures
  await repo.createMemory(
    { title: 'The great Southern road trip', story: 'Eleven days, one overheating van, and a playlist we all pretended to hate.', occurredOn: '2013-01-05', location: 'Southern Scenic Route', photos: [photo('roadtrip1'), photo('roadtrip2'), photo('roadtrip3'), photo('roadtrip4')] },
    travels,
  );
  await repo.createMemory(
    { title: 'Sunrise on the summit', story: 'Up at 3am, worth every frozen step. The whole valley turned gold.', occurredOn: '2019-03-17', location: 'Roys Peak', photos: [photo('summit1', 1200, 700), photo('summit2')] },
    travels,
  );

  // Standalone, recent
  await repo.createMemory({
    title: 'New Year at the beach',
    story: 'Sparklers, sandy feet, and the whole family counting down together.',
    occurredOn: '2026-01-01',
    location: 'Tahunanui Beach',
    photos: [photo('newyear1'), photo('newyear2')],
  });
}