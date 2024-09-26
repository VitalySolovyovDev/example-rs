import { observer } from 'mobx-react-lite';

import { Investment } from 'features/bots/view/investment/Investment';

type Result = boolean extends true ? 1 : 0;

const func = () => 'trtrtr';

type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
// type FuncResult = ReturnType<typeof func>
const str = `hello_world-friend`.replace(
  /(_|-)/g,
  (item) => {
    return `${item}${item}${item}`;
  }
);

/**
 * Bot feature
 */
export const BotsForm = observer(function BotsForm() {
  const a = [
    1,1,1,1,[
      2,2,2,2,[
        3,3,3,3, [
          4,4,4, 4, [
            5,5,5,5,[
              6,6,6,6, [
                7,7,7,7
              ]
            ]
          ]
        ]
      ]
    ]
  ];
  console.log(str);
  return <Investment />;
});
