@RestResource(urlMapping='/Api/Employees/CRUD/*')
global class CRUD {
    @HttpGet
    global static List<Emp__c> index() {
        return [Select Id, Name__c, Email__c, BirthDay__c, Phone__c, Memo__c From Emp__c];
    }
    @HttpPost
    global static Emp__c create(String Name, String Email, String Phone, Date Birthday, String Memo){
        Emp__c newItem = new Emp__c();
        newItem.Name__c = Name;
        newItem.Email__c = Email;
        newItem.Phone__c = Phone;
        newItem.BirthDay__c = BirthDay;
        newItem.Memo__c = Memo;
        insert newItem;
        return newItem;
    }
    @HttpPut
    global static Emp__c updateEmployee(Id Id, String Name, String Email, String Phone, Date Birthday, String Memo) {
        try {
            Emp__c item = new Emp__c();
            item = [Select Id, Name__c, Email__c, BirthDay__c, Memo__c, Phone__c from Emp__c WHERE Id = :Id];
            item.Name__c = Name;
            item.Email__c = Email;
            item.Phone__c = Phone;
            item.BirthDay__c = BirthDay;
            item.Memo__c = Memo;
            update item;
            return item;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @HttpDelete
    global static String deleteEmployee() {
        try {
            RestRequest req = RestContext.request;
            String Id = req.requestURI.substring(req.requestURI.lastIndexOf('/')+1);
            Emp__c item = new Emp__c();
            item = [Select Id, Name__c from Emp__c WHERE Id = :Id];
            delete item;
            return 'Deleted ' + item.Name__c + ' Successfully!';
        } catch (Exception e) {
            return e.getMessage();
        }
    }
}