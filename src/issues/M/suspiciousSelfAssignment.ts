import { InputType, IssueTypes, Instance, ASTIssue } from '../../types';
import { findAll } from 'solidity-ast/utils';
import { instanceFromSRC } from '../../utils';
import { Expression } from 'solidity-ast';


function compare(left: Expression | null | undefined, right: Expression | null | undefined): boolean {
    if (left == null || right == null) return false;    
    if (left.nodeType != right.nodeType) return false;
    
    if (left.nodeType == "Literal" && right.nodeType == "Literal") {
        return left.value == right.value;
    }

    if (left.nodeType == "Identifier" && right.nodeType == "Identifier") {
        return left.name == right.name;
    }

    if (left.nodeType == "IndexAccess" && right.nodeType == "IndexAccess") {
        let base = compare(left.baseExpression,right.baseExpression) 
        let index = compare(left.indexExpression,right.indexExpression);
        return base && index;
    }

    return false;
}

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.M,
  title: 'Suspicious Self Assignment',
  description:
    'The current self-assignment is either redundant or incorrect, which signifies that a potential incorrect value assignment.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        for (const node of findAll('Assignment', file.ast)) {
            let hit = false;
            
            hit = compare(node.leftHandSide,node.rightHandSide);

            if (hit) {
                instances.push(instanceFromSRC(file, node.src));
            }

        }
      }
    }
    return instances;
  },
};

export default issue;
