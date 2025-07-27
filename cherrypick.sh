set -ex

git checkout main

git log wip --pretty=format:"%H" --not main | cat - <(echo "") | tac | while read hash || [[ -n $hash ]]; do
    git cherry-pick -n $hash
    git commit -m "$(git log --format=%B -n 1 $hash | xargs)"
done

git push

git checkout wip

git reset --hard main
