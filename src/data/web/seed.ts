import type { Repository } from '../repository';

const photo = (seed: string) => ({
  uri: `https://picsum.photos/seed/forkeeps-${seed}/900/700`,
  width: 900,
  height: 700,
  mimeType: 'image/jpeg',
});

/** Demo content for the browser preview so every screen has something to show. */
export async function seed(repo: Repository) {
  const album = await repo.createAlbum('Summers at the Lake', 'Every July since 1998');
  await repo.createMemory(
    { title: 'First swim off the dock', story: 'Grandpa held the rope while everyone cheered from the shore.', occurredOn: '1998-07-14', location: 'Lake Wanaka', photos: [photo('dock')] },
    album,
  );
  await repo.createMemory(
    { title: 'The big family picnic', story: 'Four generations, one very long table.', occurredOn: '2009-07-02', location: 'Lake Wanaka', photos: [photo('picnic1'), photo('picnic2'), photo('picnic3')] },
    album,
  );
  await repo.createMemory(
    { title: "Nana's lemon cake recipe", story: 'Two lemons, a lot of butter, and never measure the sugar.', occurredOn: '2015-07-20', location: null, photos: [] },
    album,
  );
  await repo.createMemory({ title: 'Graduation day', story: '', occurredOn: '2024-12-10', location: 'Dunedin', photos: [photo('grad1'), photo('grad2')] });
}
