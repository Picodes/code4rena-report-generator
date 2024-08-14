import { InputType, IssueTypes, Instance, ASTIssue } from '../../types';
import { findAll } from 'solidity-ast/utils';
import { instanceFromSRC } from '../../utils';
import { Expression } from 'solidity-ast';

// Iterative compare function to compare left and right nodes.
function compare(left: Expression | null | undefined, right: Expression | null | undefined): boolean {
    // If null/undefined, return false
    if (left == null || right == null) return false;
    // If nodeType Not equal, return false  
    if (left.nodeType != right.nodeType) return false;
    
    // Literal
    if (left.nodeType == "Literal" && right.nodeType == "Literal") {
        return left.value == right.value;
    }

    // Identifier
    if (left.nodeType == "Identifier" && right.nodeType == "Identifier") {
        return left.name == right.name;
    }

    // IndexAccess
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
  description: 'A self-assignment occurs when a variable or state is assigned a value that is already held by that variable or state itself. This situation often indicates a potential issue in the code, which can be redundant or incorrect. Specifically, self-assignment might suggest that the value assignment does not change the state of the variable, or it could be a sign of a logical error.',
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
